<template>
	<view>
		<view class="material">
			<view class="user">
				<view class="picture">
					<u-image src="https://cdn.uviewui.com/uview/album/1.jpg" width="120rpx" height="120rpx"
						shape="circle"></u-image>
				</view>
				<view class="info">
					<view>{{userName}}</view>
					<view>所属机构:{{formatBranch()}}</view>
					<view>配送中心:{{formatTransBranch()}}</view>
				</view>
			</view>
			<view class="tool">
				<view class="column">
					<image class="avatar" src="/static/mine/collect.png"></image>
					<view>收藏</view>
				</view>
				<view class="column" @click="onViewBalance">
					<image class="avatar" src="/static/mine/balance.png"></image>
					<view>余额</view>
				</view>
			</view>
		</view>
		<view class="menu">
			<view class="column">
				<view class="header">
					<view class="title">我的订单</view>
					<view class="action">
						<u--text suffixIcon="arrow-right" align="right" size="12" color="#999" text="查看全部"
							:iconStyle="iconStyle" @click="onViewOrder"></u--text>
					</view>
				</view>
				<view class="content">
					<u-grid :border="false" :col="4">
						<u-grid-item v-for="item in orderList" :key="item.text" @click="onOrderEvent">
							<image class="avatar" :src="item.icon"></image>
							<text class="grid-text">{{item.text}}</text>
						</u-grid-item>
					</u-grid>
				</view>
			</view>
			<view class="column">
				<view class="header">
					<view class="title">团购/票券</view>
				</view>
				<view class="content">
					<u-grid :border="false" :col="4" @click="onActivityEvent">
						<u-grid-item v-for="item in activityList" :key="item.text">
							<image class="avatar" :src="item.icon"></image>
							<text class="grid-text">{{item.text}}</text>
						</u-grid-item>
					</u-grid>
				</view>
			</view>
			<view class="column">
				<view class="header">
					<view class="title">系统服务</view>
				</view>
				<view class="content">
					<u-grid :border="false" :col="4" @click="onServiceEvent">
						<u-grid-item v-for="item in serviceList" :key="item.text">
							<image class="avatar" :src="item.icon"></image>
							<text class="grid-text">{{item.text}}</text>
						</u-grid-item>
					</u-grid>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userName: '',
				iconStyle: {
					fontSize: '12px',
					color: '#999'
				},
				orderList: [{
						icon: '/static/mine/payment.png',
						text: '待付款'
					},
					{
						icon: '/static/mine/car.png',
						text: '待收货'
					},
					{
						icon: '/static/mine/complete.png',
						text: '已完成'
					},
					{
						icon: '/static/mine/cancel.png',
						text: '已取消'
					}
				],
				activityList: [{
						icon: '/static/mine/tuan.png',
						text: '团购'
					},
					{
						icon: '/static/mine/coupon.png',
						text: '优惠券'
					},
					{
						icon: '/static/mine/integral.png',
						text: '积分'
					},
					{
						icon: '/static/mine/exchange.png',
						text: '积分兑换'
					}
				],
				serviceList: [{
						icon: '/static/mine/exit.png',
						text: '退出登录'
					},
					{
						icon: '/static/mine/address.png',
						text: '收货地址'
					},
					{
						icon: '/static/mine/mine.png',
						text: '关于我们'
					}
				]
			}
		},
		onLoad() {
			this.userName = uni.getStorageSync('userName');
		},
		methods: {
			// 查看余额
			onViewBalance() {
				uni.navigateTo({
					url: '/packageMine/pages/balance/index'
				})
			},
			// 查看订单
			onViewOrder() {
				uni.navigateTo({
					url: '/packageMine/pages/order/index'
				})
			},
			// 监听订单点击事件
			onOrderEvent(index) {
				uni.navigateTo({
					url: `/packageMine/pages/order/index?type=${index}`
				})
			},
			// 监听活动点击事件
			onActivityEvent(index) {
				let url;
				switch (index) {
					case 1:
						url = '/packageMine/pages/coupon/index';
						break;
						
					case 2:
						url = '/packageMine/pages/integral/index';
						break;

					default:
						break;
				}
				uni.navigateTo({
					url
				})
			},
			// 监听系统服务点击事件
			onServiceEvent(index) {
				if (index === 0) {
					uni.showModal({
						title: '提示',
						content: '是否确定退出登录',
						success: (res) => {
							if (res.confirm) {
								this.$utils.logout();
							}
						}
					});
				}
			},
			// 格式化机构信息
			formatBranch() {
				return `【${uni.getStorageSync('branchNo')}】${uni.getStorageSync('branchName')}`;
			},
			// 格式化配送中心
			formatTransBranch() {
				return `【${uni.getStorageSync('transBranchNo')}】`;
			}
		}
	}
</script>

<style lang="scss">
	.material {
		color: #f1f1f1;
		background-color: #377cfd;

		.user {
			display: flex;
			flex-direction: row;
			padding: 20rpx;

			.picture {
				width: 140rpx;
				padding: 12rpx 0;
			}

			.info {
				flex: 1;
				overflow: hidden;

				view {
					height: 48rpx;
					line-height: 48rpx;
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
				}
			}
		}

		.tool {
			display: flex;
			flex-direction: row;

			.column {
				flex: 1;
				padding: 20rpx 0;

				.avatar {
					display: block;
					width: 49rpx;
					height: 49rpx;
					margin: 0 auto;
				}

				view {
					margin-top: 12rpx;
					font-size: 24rpx;
					text-align: center;
				}
			}
		}
	}

	.menu {
		padding: 0 20rpx 20rpx;

		.column {
			margin-top: 20rpx;
			border-radius: 12rpx;
			background-color: #fff;

			.header {
				display: flex;
				flex-direction: row;
				padding: 24rpx 20rpx;

				.title {
					flex: 1;
					font-size: 16px;
					color: #333;
					line-height: 32rpx;
				}

				.action {
					flex: 1;
				}
			}

			.content {
				padding: 10rpx 0;

				.avatar {
					display: block;
					width: 51rpx;
					height: 51rpx;
					margin: 0 auto;
				}

				.grid-text {
					font-size: 12px;
					color: #666;
					line-height: 28px;
				}
			}
		}
	}
</style>
