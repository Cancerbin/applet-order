<template>
	<view>
		<view class="container">
			<view class="column" v-for="item in listData" :key="item.hostingSellerNo">
				<view class="picture">
					<u--image :src="item.logoUrl" width="140rpx" height="140rpx" radius="4"></u--image>
				</view>
				<view class="detail">
					<view class="title">{{item.hostingSellerName}}</view>
					<view class="info">
						<view class="base">
							<view>简介：{{item.introDesc || ''}}</view>
							<view>商户电话：{{item.contactPhone || ''}}</view>
						</view>
						<view class="price">起送价：<text>{{parseFloat(item.mixDeliveryAmt || 0)}}元</text></view>
					</view>
				</view>
			</view>
		</view>

		<u-loadmore v-if="listData.length" :status="loadingStatus" />
		<view v-else class="empty">
			<u-empty mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png" text="暂无商家入驻">
			</u-empty>
		</view>
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
				scrollTop: 0,
				loadingStatus: 'nomore',
				src: 'https://cdn.uviewui.com/uview/album/1.jpg'
			}
		},
		onLoad() {
			this.fetchMerchantList();
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
		},
		onPullDownRefresh() {
			this.page = 1;
			this.fetchMerchantList();
		},
		onReachBottom() {
			if (!this.loading && this.page < this.pages) {
				this.page += 1;
				this.fetchMerchantList();
			}
		},
		methods: {
			fetchMerchantList() {
				this.loading = true;
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/hostingSeller/bizPage',
					data: {
						current: 1,
						model: {},
						size: 50
					}
				}).then(res => {
					uni.hideLoading();
					uni.stopPullDownRefresh();
					this.loading = false;
					if (res?.code === 0) {
						if (this.page === 1) {
							uni.pageScrollTo({
								scrollTop: 0,
								duration: 300
							});
							this.listData = res.data.records;
						} else {
							this.listData = this.listData.concat(res.data.records);
						}
						this.pages = res.data.pages;
						this.loadingStatus = this.page < res.data.pages ? 'loading' : 'nomore';
					}
				})
			}
		}
	}
</script>


<style lang="scss">
	page {
		background: #f1f1f1;

		.container {

			.column {
				display: flex;
				flex-direction: row;
				margin-top: 16rpx;
				padding: 16rpx;
				background-color: #fff;

				.picture {
					width: 156rpx;
				}

				.detail {
					flex: 1;
					overflow: hidden;
					
					.title {
						height: 58rpx;
						color: #333;
						line-height: 58rpx;
					}

					.info {
						display: flex;
						flex-direction: row;
						margin-top: 10rpx;
						
						.base {
							flex: 1;
							font-size: 20rpx;
							color: #666;
							
							view {
								height: 36rpx;
								line-height: 36rpx;
								text-overflow: ellipsis;
								white-space: nowrap;
								overflow: hidden;
							}
						}
						
						.price {
							flex: 1;
							font-size: 24rpx;
							color: #666;
							text-align: right;
							
							text {
								color: #f60;
							}
						}
					}
				}
			}
		}
	}
</style>
