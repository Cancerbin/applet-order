<template>
	<view>
		<u-sticky offset-top="0">
			<view class="tab">
				<view v-for="item in tabList" :key="item.value" :class="{active: tabKey === item.value}"
					@click="onChangeTab(item.value)">{{item.label}}</view>
			</view>
		</u-sticky>
		<view class="list">
			<view class="option" v-for="item in listData" :key="item.id">
				<view class="coupon">
					<u--image src="/static/coupon/background.png" :lazyLoad="false" :fade="false" width="170rpx"
						height="180rpx"></u--image>
					<view class="info">
						<view v-if="item.typeModel === '0'">
							<view class="amount">￥<text>{{parseFloat(item.price)}}</text></view>
							<view class="condition">满{{parseFloat(item.conditionPrice)}}元可用</view>
						</view>
						<view v-else class="commodity">商品券</view>
					</view>
				</view>
				<view class="content">
					<view class="info">
						<view class="title">{{item.typeName}}</view>
						<view class="remark">活动内容：{{item.activityContent || '无'}}</view>
					</view>
					<u-line></u-line>
					<view class="limit">使用期限：{{formatLimitDate(item)}}</view>
				</view>
			</view>
			<u-loadmore v-if="listData.length" :status="loadStatus" />
		</view>
		<u-empty v-if="!listData.length" mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"
			marginTop="100rpx"></u-empty>
		<u-back-top :scroll-top="scrollTop"></u-back-top>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabList: [{
						label: '未使用',
						value: '1'
					},
					{
						label: '已使用',
						value: '2'
					},
					{
						label: '已过期',
						value: '3'
					}
				],
				tabKey: '1',
				page: 1,
				size: 20,
				pages: 1,
				listData: [],
				isLoading: false,
				scrollTop: 0,
				loadStatus: 'loadmore'
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
			}, 1000);
		},
		onReachBottom() {
			if (!this.isLoading && this.page < this.pages) {
				this.page += 1;
				this.fetchCouponList();
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
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
					url: "/api/order/wechat/coupon/bizPage",
					data: {
						current: this.page,
						size: this.size,
						model: {
							status: this.tabKey
						}
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
			// 切换tab
			onChangeTab(key) {
				if (this.tabKey !== key) {
					this.tabKey = key;
					this.page = 1;
					this.listData = [];
					this.fetchCouponList();
				}
			},
			// 格式化使用期限
			formatLimitDate(record) {
				let text;
				switch (record.validType) {
					case '0':
						text = "永久有效";
						break;

					default:
						text = `${record.startDate.substring(0, 10)} ~ ${record.endDate.substring(0, 10)}`;
						break;
				}
				return text;
			}
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

		.tab {
			display: flex;
			font-size: 28rpx;
			color: #333;
			text-align: center;
			box-shadow: 0 3rpx 5rpx rgba(0, 0, 0, .1);
			background-color: #fff;

			view {
				flex: 1;
				padding: 28rpx 0;

				&.active {
					position: relative;
					font-weight: bold;
					color: #377cfd;

					&::after {
						content: "";
						position: absolute;
						left: 50%;
						bottom: 0;
						width: 140rpx;
						height: 6rpx;
						background-color: #377cfd;
						transform: translateX(-50%);
					}
				}
			}
		}

		.list {
			padding: 0 20rpx;

			.option {
				display: flex;
				flex-direction: row;
				margin-top: 20rpx;

				.coupon {
					position: relative;

					.info {
						position: absolute;
						top: 0;
						left: 0;
						width: 170rpx;
						padding: 48rpx 0;
						color: #fff;
						text-align: center;

						.amount {
							height: 48rpx;
							font-size: 24rpx;
							line-height: 48rpx;

							text {
								font-size: 36rpx;
								font-weight: bold;
							}
						}

						.condition {
							height: 36rpx;
							font-size: 24rpx;
							line-height: 36rpx;
						}

						.commodity {
							height: 84rpx;
							font-size: 36rpx;
							line-height: 84rpx;
						}
					}

					&::after {
						content: "";
						position: absolute;
						top: 0;
						right: 0;
						width: 20rpx;
						height: 100%;
						background-color: #fff;
						z-index: -1;
					}
				}

				.content {
					display: flex;
					flex-direction: column;
					flex: 1;
					padding: 0 16rpx;
					background-color: #fff;
					overflow: hidden;

					.info {
						flex: 1;
						height: 100%;
						overflow: hidden;

						.title {
							height: 36rpx;
							padding-top: 10rpx;
							font-size: 28rpx;
							color: #333;
							line-height: 36rpx;
							text-overflow: ellipsis;
							white-space: nowrap;
							overflow: hidden;
						}

						.remark {
							margin-top: 10rpx;
							font-size: 24rpx;
							color: #666;
							line-height: 32rpx;
						}
					}

					.limit {
						height: 32rpx;
						padding: 10rpx 0;
						font-size: 24rpx;
						color: #999;
						line-height: 32rpx;
					}
				}
			}
		}
	}
</style>
