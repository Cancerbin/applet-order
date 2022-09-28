<template>
	<layout>
		<view class="material">
			<u-search v-model="condition" :show-action="false" placeholder="请输入订单号" @search="onSearch"
				@clear="onSearch">
			</u-search>
		</view>
		<scroll-view slot="bottom" class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
			:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
			:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefreshData"
			@scrolltolower="onLoadData" @scroll="onScroll">
			<view class="container">
				<view class="option" v-for="item in listData" :key="item.id" @click="onViewDetail(item)">
					<view class="content">
						<view class="order">订单号：{{item.sheetNo}}</view>
						<view class="status">
							<u--text v-if="item.status === 0 && item.isPaid === 0" size="13" type="error" text="待付款"
								align="right"></u--text>
							<u--text v-if="item.status === 0 && item.isPaid === 1" size="13" type="error" text="支付异常"
								align="right"></u--text>
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
				queryStatus: '-1',
				sheetNo: '',
				condition: '',
				page: 1,
				size: 50,
				pages: 1,
				listData: [],
				refreshStatus: false,
				isLoading: false,
				loadStatus: 'loadmore',
				scrollTop: 0,
				realScrollTop: 0
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
			this.fetchList();
		},
		methods: {
			// 获取订单列表
			fetchList() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.isLoading = true;
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
			// 监听滚动事件
			onScroll(e) {
				this.realScrollTop = e.detail.scrollTop;
			},
			// 刷新数据
			onRefreshData() {
				this.refreshStatus = true;
				this.page = 1;
				this.fetchList();
			},
			// 加载数据
			onLoadData() {
				if (!this.isLoading && this.page < this.pages) {
					this.page += 1;
					this.fetchList();
				}
			},
			// 返回顶部
			onBackTop() {
				this.scrollTop = this.realScrollTop;
				this.$nextTick(() => {
					this.scrollTop = 0;
				});
			},
			// 查询事件
			onSearch() {
				this.sheetNo = this.condition.trim();
				this.page = 1;
				this.fetchList();
			},
			// 查看订单详情
			onViewDetail(record) {
				uni.navigateTo({
					url: `/packageMine/pages/order/detail/index?sheetNo=${record.sheetNo}`
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
			padding: 10rpx;
			background-color: #fff;
			box-shadow: 0 0 4px rgba(0, 0, 0, .2);
			z-index: 2;
		}

		.scroll {
			height: 100%;

			.container {
				padding-top: 20rpx;
				padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

				.option {
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

				.empty {
					padding-top: 150rpx;
				}
			}
		}
	}
</style>
