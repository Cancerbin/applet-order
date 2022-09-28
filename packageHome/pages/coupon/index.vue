<template>
	<view>
		<view class="banner">
			<picture url="/static/coupon/banner.jpg" />
		</view>
		<view class="container">
			<view class="list">
				<view class="option" v-for="item in listData" :key="item.activityCode">
					<view class="left">
						<u--image src="/static/coupon/background.png" :lazyLoad="false" :fade="false" width="170rpx"
							height="180rpx"></u--image>
						<view class="amount">
							<text
								v-if="item.orderCouponType.type === '0'">￥{{parseFloat(item.orderCouponType.price)}}</text>
							<text v-else>商品券</text>
						</view>
					</view>
					<view class="right">
						<view class="info">
							<view class="name">{{item.activityName}}</view>
							<view class="rule">活动规则：{{item.content}}</view>
							<view class="time">{{formatDate(item.activityStartDate)}} -
								{{formatDate(item.activityEndDate)}}
							</view>
						</view>
						<view class="btn" @click="onReceive(item)">
							<view>领取</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import picture from '@/components/picture/index.vue';
	export default {
		data() {
			return {
				page: 1,
				size: 20,
				pages: 1,
				listData: []
			}
		},
		onLoad() {
			this.fetchCouponList();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.fetchCouponList();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 300);
		},
		onReachBottom() {
			if (!this.isLoading && this.page < this.pages) {
				this.page += 1;
				this.fetchCouponList();
			}
		},
		methods: {
			// 获取优惠券列表
			fetchCouponList() {
				this.isLoading = true;
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: "POST",
					url: "/api/order/wechat/coupon/activity/bizPage",
					data: {
						current: this.page,
						size: this.size,
						model: {}
					}
				}).then(res => {
					this.isLoading = false;
					if (res?.code === 0) {
						const {
							records = [], pages
						} = res.data;
						this.pages = pages;
						if (this.page === 1) {
							this.listData = records;
						} else {
							this.listData = this.listData.concat(records);
						}
						this.loadStatus = this.page < pages ? 'loadmore' : 'nomore';
						uni.hideLoading();
					}
				})
			},
			// 格式化时间
			formatDate(value) {
				return value.substring(0, 10);
			}
		},
		components: {
			picture
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);
		background-color: #f66550;

		.container {
			padding: 0 20rpx 20rpx 20rpx;

			.list {
				background-color: #fff;

				.option {
					display: flex;
					flex-direction: row;
					padding: 20rpx 20rpx 0;

					.left {
						position: relative;
						width: 170rpx;
						height: 180rpx;

						.amount {
							position: absolute;
							top: 0;
							left: 0;
							width: 100%;
							height: 100%;
							font-size: 36rpx;
							font-weight: bold;
							color: #fff;
							line-height: 180rpx;
							text-align: center;
						}
					}

					.right {
						display: flex;
						flex: 1;
						border: 1rpx solid #ddd;
						border-left: 0;

						.info {
							flex: 1;
							padding: 18rpx;

							.name {
								height: 36rpx;
								font-size: 28rpx;
								line-height: 36rpx;
							}

							.rule {
								font-size: 24rpx;
								color: #999;
								line-height: 32rpx;
							}

							.time {
								font-size: 24rpx;
								color: #999;
								line-height: 32rpx;
							}
						}

						.btn {
							width: 120rpx;
							padding: 58rpx 10rpx;

							view {
								height: 64rpx;
								font-size: 28rpx;
								color: #fff;
								line-height: 64rpx;
								text-align: center;
								border-radius: 36rpx;
								background-color: #f66550;
							}
						}
					}

					&:last-child {
						padding-bottom: 20rpx;
					}
				}
			}
		}
	}
</style>
