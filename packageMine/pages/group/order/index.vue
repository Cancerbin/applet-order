<template>
	<view>
		<view class="option" v-for="item in listData" :key="item.id" @click="onViewDetail(item)">
			<view class="main">
				<view class="order">订单号：{{item.sheetNo}}</view>
				<view class="price">￥{{$utils.formatValue(item.totalAmt)}}</view>
			</view>
			<u-line></u-line>
			<view class="details">
				<view>团购商品：{{item.itemName}}</view>
				<view>团购数量：<text>x{{parseFloat(item.count)}}</text></view>
				<view>团购时间：{{item.createTime}}</view>
			</view>
		</view>
		<u-loadmore v-if="listData.length" :status="loadStatus" />
		<u-empty v-if="!listData.length" mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"
			marginTop="200rpx"></u-empty>
		<u-back-top :scroll-top="scrollTop"></u-back-top>
	</view>
</template>

<script>
	export default {
		data() {
			return {
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
			this.fetchOrderList();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.fetchOrderList();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onReachBottom() {
			if (!this.isLoading && this.page < this.pages) {
				this.page += 1;
				this.fetchOrderList();
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		methods: {
			// 获取订单列表
			fetchOrderList() {
				this.isLoading = true;
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: "POST",
					url: "/api/order/wechat/groupBuy/bizPageForGroupBuyOrder",
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
			onViewDetail(record) {
				uni.navigateTo({
					url: `./detail?detail=${encodeURIComponent(JSON.stringify(record))}`
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

		.option {
			margin-top: 20rpx;
			padding: 20rpx;
			background-color: #fff;

			.main {
				display: flex;
				flex-direction: row;
				padding-bottom: 20rpx;
				line-height: 48rpx;

				.order {
					flex: 1;
					color: #333;
				}

				.price {
					width: 200rpx;
					font-size: 28rpx;
					color: #f50;
					text-align: right;
				}
			}

			.details {
				margin-top: 20rpx;
				font-size: 24rpx;
				color: #888;

				view {
					margin-top: 16rpx;

					&:first-child {
						margin-top: 0;
					}

					text {
						color: #f50;
					}
				}
			}
		}
	}
</style>
