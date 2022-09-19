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
					<u-input placeholder="请输入账号/手机号" border="none"></u-input>
				</view>
				<view class="formItem">
					<u-input :password="isPassword" placeholder="请输入密码" border="none">
						<template slot="suffix">
							<u-icon slot="right" :name="icon" color="#999" size="20" @click="onChangeIcon">
							</u-icon>
						</template>
					</u-input>
				</view>
			</view>
			<view class="submit">
				<button class="btn" type="primary">登录</button>
			</view>
		</view>
		<view class="footer">
			<u-checkbox-group>
				<u-checkbox :checked="isProtocol" shape="circle" size="14" label="已阅读并同意" labelSize="12"></u-checkbox>
			</u-checkbox-group>
			<text>店帮手用户协议(含隐私政策)、敏感个人信息处理授权协议、个人信息共享授权协议</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '',
				logo: '',
				isProtocol: false,
				isPassword: true,
				icon: 'eye-fill'
			}
		},
		onLoad() {
			const isProtocol = uni.getStorageSync('isProtocol');
			const appId = wx.getAccountInfoSync().miniProgram.appId;

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

			// 协议勾选状态赋值
			if (isProtocol) {
				this.isProtocol = isProtocol;
			}
		},
		methods: {
			// 切换icon
			onChangeIcon() {
				this.icon = !this.isPassword ? 'eye-fill' : 'eye-off';
				this.isPassword = !this.isPassword;
			}
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		overflow: hidden;

		.container {
			display: flex;
			flex-direction: column;
			width: 600rpx;
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
