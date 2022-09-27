<template>
	<view>
		<u-sticky offset-top="0">
			<view class="banner">
				<picture :url="banner" />
				<view class="view" @click="onViewOrder">查看团购订单</view>
			</view>
		</u-sticky>

		<view class="list">
			<view class="option" v-for="item in listData" :key="item.id">
				<view class="picture">
					<u--image :src="$utils.formatPicture(item.picUrl)" :lazyLoad="false" :fade="false" mode="aspectFit"
						width="250rpx" height="250rpx"></u--image>
				</view>
				<view class="main">
					<view class="title">
						<view class="tag">多人团</view>
						<view class="text">{{item.itemName}}</view>
					</view>
					<view class="sale">
						<view class="status">补货售卖中</view>
						<view class="text">已销：{{parseFloat(item.promotionItemVO.sellQuantity || 0)}}{{item.unitName}}
						</view>
					</view>
					<view class="limit">
						<u-count-down :time="limitTime" autoStart @change="onUpdateTime">
							<view class="time">
								<text>距结束</text>
								<text class="node">
									{{ timeData.days > 9 ? timeData.days: '0' + timeData.days}}
								</text>天
								<text class="node">
									{{ timeData.hours > 9 ? timeData.hours: '0' + timeData.hours}}
								</text>时
								<text class="node">
									{{ timeData.minutes > 9 ? timeData.minutes: '0' + timeData.minutes}}
								</text>分
								<text class="node">
									{{ timeData.seconds > 9 ? timeData.seconds: '0' + timeData.seconds}}
								</text>秒
							</view>
						</u-count-down>
					</view>
					<view class="original">原价：￥{{$utils.formatValue(item.transPrice)}}</view>
					<view class="participate">
						<view class="price">多人团价￥{{$utils.formatValue(item.promotionItemVO.specTransPrice)}}</view>
						<view class="btn" @click="onJoin(item)">去参团</view>
					</view>
				</view>
			</view>
		</view>
		<u-loadmore v-if="listData.length" :status="loadStatus" />
		<u-empty v-if="!listData.length" mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"
			marginTop="100rpx"></u-empty>
		<u-back-top :scroll-top="scrollTop"></u-back-top>
	</view>
</template>

<script>
	import picture from '@/components/picture/index.vue';
	export default {
		data() {
			return {
				banner: "https://dbs-res-data.obs.cn-south-1.myhuaweicloud.com/applet/saas-mall/group/groupBg.jpg",
				page: 1,
				size: 20,
				pages: 1,
				listData: [],
				limitTime: '',
				timeData: {},
				scrollTop: 0,
				isLoading: false,
				loadStatus: 'loadmore'
			}
		},
		onLoad() {
			this.fetchGroupList();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.fetchGroupList();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onReachBottom() {
			if (!this.isLoading && this.page < this.pages) {
				this.page += 1;
				this.fetchGroupList();
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		methods: {
			// 获取团购数据
			fetchGroupList() {
				this.isLoading = true;
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: "POST",
					url: "/api/order/wechat/groupBuy/bizPageForSellingGroupCoupon",
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
						this.limitTime = new Date(res.extra.endDate.replace(/-/g, '/')).getTime() - new Date()
							.getTime();
						this.loadStatus = this.page < pages ? 'loadmore' : 'nomore';
						uni.hideLoading();
					}
				})
			},
			// 更新倒计时
			onUpdateTime(e) {
				this.timeData = e
			},
			// 查看订单
			onViewOrder() {
				uni.navigateTo({
					url: './order/index'
				})
			},
			// 参团
			onJoin(record) {
				uni.navigateTo({
					url: `./detail/index?detail=${encodeURIComponent(JSON.stringify(record))}`
				})
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

		.banner {
			position: relative;

			image {
				display: block;
				width: 100%;
			}

			.view {
				position: absolute;
				right: 0;
				bottom: 30rpx;
				padding: 20rpx;
				padding-left: 24rpx;
				font-size: 24rpx;
				color: #fff;
				line-height: 28rpx;
				border-top-left-radius: 34rpx;
				border-bottom-left-radius: 30rpx;
				background-color: rgba(0, 0, 0, 0.6);
			}
		}

		.list {

			.option {
				display: flex;
				flex-direction: row;
				margin-top: 20rpx;
				padding: 20rpx;
				background-color: #fff;

				.picture {
					width: 270rpx;
				}

				.main {
					flex: 1;
					overflow: hidden;

					.title {
						display: flex;
						flex-direction: row;
						height: 48rpx;
						font-size: 28rpx;
						line-height: 48rpx;

						.tag {
							width: 120rpx;
							color: #fff;
							text-align: center;
							background-color: #f15221;
						}

						.text {
							flex: 1;
							height: 48rpx;
							padding-left: 16rpx;
							font-weight: bold;
							color: #333;
							text-overflow: ellipsis;
							white-space: nowrap;
							overflow: hidden;
						}
					}

					.sale {
						display: flex;
						flex-direction: row;
						height: 42rpx;
						margin-top: 16rpx;
						font-size: 24rpx;
						line-height: 42rpx;

						.status {
							width: 200rpx;
							color: #fff;
							text-align: center;
							border-radius: 21rpx;
							background: linear-gradient(to left, #ffb661FF, #F15221);
						}

						.text {
							flex: 1;
							padding-left: 16rpx;
							color: #666;
						}
					}

					.limit {
						margin-top: 16rpx;
						height: 36rpx;

						.time {
							font-size: 24rpx;
							color: #333;
							line-height: 36rpx;

							.node {
								margin: 0 4rpx;
								padding: 0 8rpx;
								color: #fff;
								border-radius: 6rpx;
								background-color: #377cfd;
							}
						}
					}

					.original {
						margin: 10rpx 0;
						height: 32rpx;
						font-size: 24rpx;
						color: #999;
						line-height: 32rpx;
					}

					.participate {
						display: flex;
						flex-direction: row;
						height: 50rpx;
						font-size: 28rpx;
						line-height: 50rpx;
						text-align: center;

						.price {
							flex: 1;
							height: 50rpx;
							color: #CE4032;
							background: #F9EEEE;
						}

						.btn {
							width: 180rpx;
							height: 50rpx;
							color: #fff;
							background: #CE4032;
						}
					}
				}
			}
		}
	}
</style>
