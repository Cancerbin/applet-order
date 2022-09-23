<template>
	<view>
		<view class="list">
			<view class="option" v-for="item in listData" :key="item.id">
				<view class="picture">
					<u-image :src="$utils.formatPicture(item.picUrl)" :lazyLoad="false" :fade="false" mode="aspectFit"
						width="140rpx" height="140rpx">
					</u-image>
				</view>
				<view class="content">
					<view class="title">{{item.itemName}}</view>
					<view class="mark">兑换积分：{{item.costJifen}}</view>
					<view class="mark">配送状态：{{item.deliveryStatus === '1' ? '待配送':'已配送'}}</view>
					<view class="mark">兑换时间：{{item.createTime}}</view>
				</view>
			</view>
			<u-loadmore v-if="listData.length" :status="loadStatus" />
		</view>
		<u-empty v-if="!listData.length" mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"
			marginTop="100rpx"></u-empty>
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
				loadStatus: 'loadmore'
			}
		},
		onLoad() {
			this.fetchExchangeRecord();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.fetchExchangeRecord();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onReachBottom() {
			if (!this.isLoading && this.page < this.pages) {
				this.page += 1;
				this.fetchExchangeRecord();
			}
		},
		methods: {
			// 获取兑换记录
			fetchExchangeRecord() {
				this.isLoading = true;
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: "POST",
					url: "/api/order/wechat/jifen/exchangeRecord",
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
			}
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

		.list {
			padding: 0 20rpx;

			.option {
				display: flex;
				flex-direction: row;
				margin-top: 20rpx;
				padding: 20rpx;
				background-color: #fff;

				.picture {
					width: 160rpx;
				}

				.content {
					flex: 1;

					.title {
						height: 48rpx;
						font-size: 32rpx;
						color: #333;
						line-height: 48rpx;
					}

					.mark {
						height: 32rpx;
						font-size: 24rpx;
						color: #999;
						line-height: 32rpx;
					}
				}
			}
		}
	}
</style>
