<template>
	<view class="container">
		<view class="wrapper">
			<view class="header">
				<view class="logo">
					<image :src="logo" height="80px" mode="aspectFit"></image>
				</view>
				<view class="title">{{title}}</view>
			</view>
			<view class="form">
				<view class="formItem">
					<u-input v-model="account" placeholder="请输入账号/手机号" border="none" @confirm="onPasswordFocus">
					</u-input>
				</view>
				<view class="formItem">
					<u-input v-model="password" :password="isPassword" :focus="isFocus" placeholder="请输入密码"
						border="none" @blur="onPasswordBlur">
						<template slot="suffix">
							<u-icon slot="right" :name="icon" color="#999" size="20" @click="onChangeIcon">
							</u-icon>
						</template>
					</u-input>
				</view>
			</view>
			<view class="submit">
				<button class="btn" type="primary" @click="onSubmit">登录</button>
			</view>
		</view>
		<view class="footer">
			<u-checkbox-group>
				<u-checkbox :checked="isProtocol" shape="circle" size="14" label="已阅读并同意" labelSize="12"
					@change="onChangeProtocol"></u-checkbox>
			</u-checkbox-group>
			<text @click="onViewProtocol">店帮手用户协议(含隐私政策)、敏感个人信息处理授权协议、个人信息共享授权协议</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				appId: '',
				title: '',
				logo: '',
				isProtocol: false,
				isPassword: true,
				isFocus: false,
				icon: 'eye-fill',
				account: '',
				password: ''
			}
		},
		onLoad() {
			const appId = wx.getAccountInfoSync().miniProgram.appId;
			const account = uni.getStorageSync('account');
			const isProtocol = uni.getStorageSync('isProtocol');

			// 根据appId渲染不同logo和标题
			if (appId == 'wx7748388071197f3a') {
				this.logo = 'https://dbs-res-data.obs.cn-south-1.myhuaweicloud.com/applet/saas-mall/lel/logo.jpg';
				this.title = '乐尔乐总仓下单'
			} else if (appId === 'wx498837eb9fe10337') {
				this.logo = 'https://dbs-res-data.obs.cn-south-1.myhuaweicloud.com/applet/saas-mall/lel/logo.jpg';
				this.title = '乐尔乐上河国际仓'
			} else {
				this.logo = '/static/dbsLogo.png';
				this.title = '店帮手商城'
			}

			this.appId = appId;

			// 账号赋值
			if (account) {
				this.account = account;
			}

			// 协议勾选状态赋值
			if (isProtocol) {
				this.isProtocol = true;
			}
		},
		methods: {
			// 校验微信用户
			onVerifyWxAccount(record) {
				this.$request({
					url: "/api/oauth/anno/wxCodeVerify",
					data: {
						code: record.code,
						appid: this.appId
					}
				}).then(res => {
					if (res?.code === 0) {
						uni.setStorageSync('code', record.code);
						uni.setStorageSync('tenant', res.data.tenant);
						uni.setStorageSync('openid', res.data.openid);
						this.onLogin();
					}
				})
			},
			// 登录
			onLogin() {
				this.$request({
					type: "POST",
					url: "/api/oauth/noToken/login",
					data: {
						account: this.account,
						password: this.password,
						grantType: "order_mall"
					}
				}).then(res => {
					if (res?.code === 0) {
						uni.setStorageSync('token', res.data.token);
						uni.setStorageSync('isProtocol', 'true');
						uni.setStorageSync('account', this.account);
						this.fetchUserInfo(res.data);
					}
				})
			},
			// 获取用户信息
			fetchUserInfo(record) {
				this.$request({
					url: `/api/authority/user/queryUserDetailById/${record.userId}`
				}).then(res => {
					if (res?.code === 0) {
						const {
							baseUser = {}
						} = res.data;
						const {
							org = {}
						} = baseUser;
						// 缓存用户名称
						uni.setStorageSync('userName', baseUser.name);
						// 缓存用户机构
						uni.setStorageSync('branchNo', org.orgNo);
						uni.setStorageSync('branchName', org.orgName);
						// 缓存配送中心
						uni.setStorageSync('transBranchNo', org.transBranchNo);
						// 缓存登录状态
						uni.showToast({
							title: '登录成功',
							icon: 'success',
							duration: 1500,
							mask: true,
							success: () => {
								uni.switchTab({
									url: '/pages/home/index'
								})
							}
						})
					}
				})
			},
			// 切换icon
			onChangeIcon() {
				this.icon = !this.isPassword ? 'eye-fill' : 'eye-off';
				this.isPassword = !this.isPassword;
			},
			// 密码框聚焦
			onPasswordFocus() {
				this.isFocus = true;
			},
			// 密码框失焦
			onPasswordBlur() {
				this.isFocus = false;
			},
			// 修改协议勾选状态
			onChangeProtocol(val) {
				this.isProtocol = val;
			},
			// 查看协议
			onViewProtocol() {
				uni.navigateTo({
					url: '/pages/login/protocol/index'
				})
			},
			// 提交登录
			onSubmit() {
				let failStatus = false;
				let failText = '';

				// 判断是否输入密码
				if (!this.password.trim()) {
					failStatus = true;
					failText = '密码不能为空';
				}

				// 判断是否输入账号
				if (!this.account.trim()) {
					failStatus = true;
					failText = '账号不能为空';
				}

				// 判断是否勾选协议
				if (!this.isProtocol) {
					failStatus = true;
					failText = '请阅读并同意店帮手用户协议';
				}

				if (failStatus) {
					uni.showToast({
						title: failText,
						icon: 'error',
						mask: true
					})
					return;
				}

				uni.showLoading({
					title: '登录中',
					mask: true
				})

				uni.login({
					provider: 'weixin',
					success: (res) => {
						this.onVerifyWxAccount(res);
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		background-color: #fff;
		overflow: hidden;

		.container {
			display: flex;
			flex-direction: column;
			width: 640rpx;
			height: 100%;
			margin: 0 auto;

			.wrapper {
				flex: 1;
				height: 100%;
				overflow: hidden;

				.header {

					.logo {
						height: 80px;
						margin: 100rpx auto 0 auto;

						image {
							display: block;
							width: 100%;
							height: 80px;
						}
					}

					.title {
						font-size: 18px;
						font-weight: 600;
						line-height: 48rpx;
						text-align: center;
					}
				}

				.form {
					margin-top: 80rpx;

					.formItem {
						margin-top: 30rpx;
						padding: 20rpx 0;
						border-bottom: 1rpx solid #dadbde;
					}
				}

				.submit {
					margin-top: 80rpx;

					.btn {
						padding: 10rpx 0;
						font-size: 28rpx;
						color: #f1f1f1;
						background: #377cfd;
					}
				}
			}

			.footer {
				padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

				.u-checkbox-group {
					display: inline-flex;
				}

				text {
					font-size: 12px;
					color: #377cfd;
					line-height: 36rpx;
				}
			}
		}
	}
</style>
