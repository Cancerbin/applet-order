<template>
	<layout>
		<view class="material">剩余积分：<text>{{parseFloat(detail.jifen || 0)}}</text></view>
		<scroll-view slot="bottom" class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
			:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
			:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefreshData"
			@scrolltolower="onLoadData" @scroll="onScroll">
			<view class="container">
				<view class="wrapper">
					<view class="option" v-for="item in listData" :key="item.itemNo">
						<u-image :src="$utils.formatPicture(item.picUrl)" :lazyLoad="false" :fade="false" width="340rpx"
							height="340rpx"></u-image>
						<view class="title">【积】{{item.itemName}}</view>
						<view class="size">规格：{{item.itemSize || '无'}}</view>
						<view class="price">{{item.costJifen}}积分<text>￥{{parseFloat(item.transPrice)}}</text></view>
						<view class="btn">
							<text @click="onExchange(item)">兑换</text>
						</view>
					</view>
				</view>
				<u-loadmore v-if="listData.length" :status="loadStatus" />
				<view v-else class="empty">
					<u-empty mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"></u-empty>
				</view>
			</view>
		</scroll-view>
		<u-back-top :scroll-top="realScrollTop" @click="onBackTop"></u-back-top>
	</layout>
</template>

<script>
	import layout from '@/components/layout/index.vue';
	export default {
		data() {
			return {
				detail: {},
				page: 1,
				size: 20,
				pages: 1,
				listData: [],
				limitNumber: 0,
				refreshStatus: false,
				isLoading: false,
				loadStatus: 'loadmore',
				scrollTop: 0,
				realScrollTop: 0
			}
		},
		onLoad() {
			this.fetchIntegral();
			this.fetchList();
		},
		methods: {
			// 获取积分
			fetchIntegral() {
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/jifen/query'
				}).then(res => {
					if (res?.code == 0) {
						this.detail = res.data;
					}
				})
			},
			// 获取兑换列表
			fetchList() {
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
						this.pages = Math.ceil(this.listData.length / this.size);
						this.onUpdateLimit();
						uni.hideLoading();
					}
				})
			},
			// 监听滚动事件
			onScroll(e) {
				this.realScrollTop = e.detail.scrollTop;
			},
			// 刷新数据
			onRefreshData() {
				this.refreshStatus = true;
				this.page = 1;
				this.fetchIntegral();
				this.fetchList();
			},
			// 加载数据
			onLoadData() {
				if (this.page < this.pages) {
					this.page += 1;
					this.onUpdateLimit();
				}
			},
			// 返回顶部
			onBackTop() {
				this.scrollTop = this.realScrollTop;
				this.$nextTick(() => {
					this.scrollTop = 0;
				});
			},
			// 更新限制
			onUpdateLimit() {
				this.limitNumber = this.page * this.size;
				this.loadStatus = this.page < this.pages ? 'loadmore' : 'nomore';
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
					if (res.code === 0) {
						this.fetchIntegral();
						uni.hideLoading();
						uni.showToast({
							title: '兑换成功',
							duration: 2000
						});
					}
				})
			}
		},
		components: {
			layout
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		overflow: hidden;

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

		.scroll {
			height: 100%;

			.container {
				padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

				.wrapper {
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

				.empty {
					padding-top: 150rpx;
				}
			}
		}
	}
</style>
