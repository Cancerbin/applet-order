<template>
	<view class="layout">
		<view class="material">剩余积分：<text>{{parseFloat(detail.jifen || 0)}}</text></view>
		<view class="container">
			<scroll-view class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
				:refresher-threshold="50" :refresher-triggered="refreshStatus" :scroll-with-animation="true"
				refresher-enabled="true" @refresherrefresh="onRefreshData">
				<view class="list">
					<view class="column">
						<view class="option" v-for="item in listData" :key="item.itemNo">
							<u-image :src="$utils.formatPicture(item.picUrl)" width="340rpx" height="340rpx"></u-image>
							<view class="title">【积】{{item.itemName}}</view>
							<view class="size">规格：{{item.itemSize || '无'}}</view>
							<view class="price">{{item.costJifen}}积分<text>￥{{parseFloat(item.transPrice)}}</text></view>
							<view class="btn">
								<text @click="onExchange(item)">兑换</text>
							</view>
						</view>
					</view>
					<u-empty v-if="!listData.length" mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"
						marginTop="100rpx"></u-empty>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				detail: {},
				listData: [],
				refreshStatus: false
			}
		},
		onLoad() {
			this.fetchIntegral();
			this.fetchExchangeList();
		},
		methods: {
			// 获取积分
			fetchIntegral() {
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/jifen/query',
					intercept: false
				}).then(res => {
					if (res?.code == 0) {
						this.detail = res.data;
					}
				})
			},
			// 获取兑换列表
			fetchExchangeList() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: "POST",
					url: "/api/order/wechat/jifen/queryActivity",
					data: {}
				}).then(res => {
					this.refreshStatus = false;
					if (res?.code === 0) {
						this.listData = res.data || [];
						uni.hideLoading();
					}
				})
			},
			// 刷新数据
			onRefreshData() {
				this.refreshStatus = true;
				this.listData = [];
				this.fetchIntegral();
				this.fetchExchangeList();
			},
			// 兑换商品
			onExchange(record) {
				uni.showLoading({
					title: "兑换中",
					mask: true
				})
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/jifen/exchangeItem',
					data: {
						itemNo: record.itemNo,
						jifenSheetNo: record.jifenSheetNo
					}
				}).then(res => {
					uni.hideLoading();
					if (res.code === 0) {
						this.fetchIntegral();
						uni.showToast({
							title: '兑换成功',
							duration: 2000
						});
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		overflow: hidden;

		.layout {
			display: flex;
			flex-direction: column;
			height: 100%;

			.material {
				position: relative;
				padding: 20rpx;
				font-size: 28rpx;
				color: #333;
				box-shadow: 0 0 4px rgba(0, 0, 0, .2);
				background-color: #fff;
				z-index: 2;

				text {
					color: #f00;
				}
			}

			.container {
				flex: 1;
				height: 100%;
				overflow: hidden;

				.scroll {
					height: 100%;

					.list {
						padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

						.column {
							display: flex;
							flex-direction: row;
							flex-wrap: wrap;
							justify-content: space-between;
							padding: 0 10rpx;

							.option {
								width: 340rpx;
								margin-top: 10rpx;
								padding: 10rpx;
								border-radius: 6rpx;
								background-color: #fff;

								.title {
									height: 36rpx;
									margin-top: 8rpx;
									font-size: 28rpx;
									color: #333;
									line-height: 36rpx;
									text-overflow: ellipsis;
									white-space: nowrap;
									overflow: hidden;
								}

								.size {
									margin-top: 8rpx;
									font-size: 24rpx;
									color: #999;
								}

								.price {
									font-size: 36rpx;
									color: #f00;

									text {
										font-size: 24rpx;
										color: #999;
										text-decoration: line-through;
									}
								}

								.btn {
									text-align: right;

									text {
										display: inline-block;
										padding: 14rpx 45rpx;
										font-size: 24rpx;
										color: #fff;
										border-radius: 6rpx;
										background-color: #f00;
									}
								}
							}
						}
					}
				}
			}
		}
	}
</style>
