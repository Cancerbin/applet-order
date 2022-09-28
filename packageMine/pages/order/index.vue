<template>
	<view class="layout">
		<view class="search">
			<u-search v-model="condition" :show-action="false" placeholder="请输入订单号" @search="onSearch"
				@clear="onSearch">
			</u-search>
		</view>
		<view class="container">
			<scroll-view class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
				:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
				:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefreshData"
				@scrolltolower="onLoadData" @scroll="onScroll">
				<view class="list">
					<view class="column" v-for="item in listData" :key="item.id" @click="onViewDetail(item)">
						<view class="content">
							<view class="order">订单号：{{item.sheetNo}}</view>
							<view class="status">
								<u--text v-if="item.status === 0 && item.isPaid === 0" size="13" type="error" text="待付款"
									align="right"></u--text>
								<u--text v-if="item.status === 0 && item.isPaid === 1" size="13" type="error"
									text="支付异常" align="right"></u--text>
								<u--text v-if="item.status === 1" size="13" type="primary" text="订单确认" align="right">
								</u--text>
								<u--text v-if="item.status === 2" size="13" type="primary" text="待收货" align="right">
								</u--text>
								<u--text v-if="item.status === 3" size="13" type="info" text="已取消" align="right">
								</u--text>
								<u--text v-if="item.status === 5" size="13" type="success" text="已完成" align="right">
								</u--text>
							</view>
						</view>
						<u-line></u-line>
						<view class="details">
							<view>下单时间：{{item.createTime}}</view>
							<view>下单数量：{{parseFloat(item.itemQty)}}件商品</view>
							<view>付款金额：<text>￥{{$utils.formatValue(item.payAmt)}}</text></view>
						</view>
					</view>
					<u-loadmore v-if="listData.length" :status="loadStatus" />
				</view>
				<u-empty v-if="!listData.length" mode="order" icon="http://cdn.uviewui.com/uview/empty/order.png"
					marginTop="100rpx"></u-empty>
			</scroll-view>
		</view>
		<u-back-top :scroll-top="realScrollTop" @click="onBackTop"></u-back-top>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				page: 1,
				size: 50,
				pages: 1,
				queryStatus: '-1',
				sheetNo: '',
				condition: '',
				listData: [],
				isLoading: false,
				scrollTop: 0,
				realScrollTop: 0,
				refreshStatus: false,
				loadStatus: 'loadmore'
			}
		},
		onLoad(options) {
			if (options.type) {
				let title;
				switch (options.type) {
					case '0':
						title = "待付款"
						break;

					case '1':
						title = "待收货"
						break;

					case '2':
						title = "已完成"
						break;

					case '3':
						title = "已取消"
						break;

					default:
						break;
				}
				this.queryStatus = options.type;
				uni.setNavigationBarTitle({
					title
				});
			}
			this.fetchOrderList();
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
					url: "/api/order/wechat/pmEnquiryMaster/bizPageForBranch",
					data: {
						current: this.page,
						size: this.size,
						model: {
							queryStatus: this.queryStatus,
							sheetNo: this.sheetNo
						}
					}
				}).then(res => {
					this.isLoading = false;
					this.refreshStatus = false;
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
			// 查询事件
			onSearch() {
				this.sheetNo = this.condition.trim();
				this.page = 1;
				this.listData = [];
				this.fetchOrderList();
			},
			// 查看订单详情
			onViewDetail(record) {
				uni.navigateTo({
					url: `/packageMine/pages/order/detail/index?sheetNo=${record.sheetNo}`
				})
			},
			// 监听滚动事件
			onScroll(e) {
				this.realScrollTop = e.detail.scrollTop;
			},
			// 刷新数据
			onRefreshData() {
				this.refreshStatus = true;
				this.onSearch();
			},
			// 加载数据
			onLoadData() {
				if (!this.isLoading && this.page < this.pages) {
					this.page += 1;
					this.fetchOrderList();
				}
			},
			// 返回顶部
			onBackTop() {
				this.scrollTop = this.realScrollTop;
				this.$nextTick(() => {
					this.scrollTop = 0;
				});
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

			.search {
				position: relative;
				padding: 10rpx;
				box-shadow: 0 0 4px rgba(0, 0, 0, .2);
				background-color: #fff;
				z-index: 2;
			}

			.container {
				flex: 1;
				height: 100%;
				overflow: hidden;

				.scroll {
					height: 100%;

					.list {
						padding-top: 20rpx;
						padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

						.column {
							margin-top: 20rpx;
							padding: 20rpx;
							background-color: #fff;

							.content {
								display: flex;
								flex-direction: row;
								padding-bottom: 20rpx;
								line-height: 48rpx;

								.order {
									flex: 1;
									color: #333;
								}

								.status {
									width: 120rpx;
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

							&:first-child {
								margin-top: 0;
							}
						}
					}
				}
			}
		}
	}
</style>
