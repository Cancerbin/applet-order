<template>
	<view class="layout">
		<view class="search">
			<view class="scan" @click="onScan">
				<u-icon name="scan" size="64rpx"></u-icon>
			</view>
			<view class="content">
				<u-search v-model="condition" height="64rpx" placeholder="请输入商品信息" actionText="取消" @search="onSearch"
					@clear="onSearch" @custom="onCancel">
				</u-search>
			</view>
		</view>
		<view class="container">
			<scroll-view class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
				:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
				:scroll-with-animation="true" :refresher-enabled="!isHistory" @refresherrefresh="onRefreshData"
				@scrolltolower="onLoadData" @scroll="onScroll">
				<view class="history" v-if="isHistory">
					<view class="title">
						<view class="text">历史记录</view>
						<view class="action" @click="onClearHistory">
							<u-icon name="trash" size="48rpx"></u-icon>
						</view>
					</view>
					<view class="details" v-if="searchList.length">
						<text v-for="item in searchList" :key="item" @click="this.onQuickSearch(item)">{{item}}</text>
					</view>
					<u-empty v-else mode="history" icon="http://cdn.uviewui.com/uview/empty/history.png"
						marginTop="100rpx">
					</u-empty>
				</view>
				<view class="result" v-else>
					<view v-for="(item, index) in listData" :key="item.id">
						<commodity :detail="item" :index="index" @onModify="this.onModifyNumber"
							@onClick="this.onViewCommodity" />
						<u-line></u-line>
					</view>
					<u-loadmore v-if="listData.length" :status="loadStatus" />
					<u-empty v-else mode="list" icon="http://cdn.uviewui.com/uview/empty/list.png" marginTop="100rpx">
					</u-empty>
				</view>
			</scroll-view>
		</view>
		<u-back-top :scroll-top="realScrollTop" @click="onBackTop"></u-back-top>
	</view>
</template>

<script>
	import Commodity from '@/components/commodity/index.vue';
	export default {
		data() {
			return {
				isHistory: true,
				page: 1,
				size: 20,
				pages: 1,
				listData: [],
				isLoading: false,
				itemInfo: '',
				condition: '',
				searchList: [],
				scrollTop: 0,
				realScrollTop: 0,
				refreshStatus: false,
				loadStatus: 'loadmore'
			}
		},
		onLoad(options) {
			this.searchList = uni.getStorageSync('searchCache') || [];
			if (options?.scan === 'true') {
				this.onScan();
			}
		},
		onShow() {
			this.listData = this.$utils.onSyncNumber(this.listData);
		},
		methods: {
			// 获取商品列表
			fetchCommodityList() {
				this.isLoading = true;
				this.isHistory = false;
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: "POST",
					url: '/api/order/wechat/item/bizPageForDelivery',
					data: {
						current: this.page,
						size: this.size,
						model: {
							itemInfo: this.itemInfo
						}
					}
				}).then(res => {
					this.isLoading = false;
					this.refreshStatus = false;
					this.onUpdateSearchCache();
					if (res?.code === 0) {
						const {
							records = [], pages
						} = res.data;
						const finishedData = this.$utils.onSyncNumber(records);
						this.pages = pages;
						if (this.page === 1) {
							this.listData = finishedData;
						} else {
							this.listData = this.listData.concat(finishedData);
						}
						this.loadStatus = this.page < pages ? 'loadmore' : 'nomore';
						uni.hideLoading();
					}
				})
			},
			// 扫码事件
			onScan() {
				uni.scanCode({
					scanType: ['barCode'],
					success: res => {
						this.isHistory = false;
						this.condition = res.result;
						this.itemInfo = res.result;
						this.page = 1;
						this.listData = [];
						this.fetchCommodityList();
					}
				})
			},
			// 删除历史记录
			onClearHistory() {
				uni.showModal({
					title: '提示',
					content: "是否确认清空历史记录？",
					success: (res) => {
						if (res.confirm) {
							this.searchList = [];
							uni.setStorageSync('searchCache', []);
						}
					}
				})
			},
			// 快捷查询
			onQuickSearch(text) {
				this.condition = text;
				this.itemInfo = text;
				this.page = 1;
				this.listData = [];
				this.fetchCommodityList();
			},
			// 查询事件
			onSearch() {
				if (this.itemInfo === this.condition) {
					return;
				}
				this.itemInfo = this.condition.trim();
				this.page = 1;
				this.listData = [];
				this.fetchCommodityList();
			},
			// 取消事件
			onCancel() {
				this.isHistory = true;
				this.condition = '';
				this.listData = [];
			},
			// 查看商品
			onViewCommodity(index) {
				uni.navigateTo({
					url: `/packageCategory/pages/detail/index?detail=${encodeURIComponent(JSON.stringify(this.listData[index]))}`
				})
			},
			// 修改数量
			onModifyNumber(index, number) {
				if (number) {
					this.listData[index].itemQty = number;
				} else {
					this.listData[index].itemQty = 0;
				}
			},
			// 更新搜索缓存
			onUpdateSearchCache() {
				const searchCache = uni.getStorageSync('searchCache') || [];
				if (this.itemInfo?.trim()) {
					if (searchCache.indexOf(this.itemInfo) < 0) {
						searchCache.push(this.itemInfo.trim());
						if (searchCache.length > 20) {
							searchCache.shift();
						}
						uni.setStorageSync('searchCache', searchCache);
						this.searchList = searchCache;
					}
				}
			},
			// 监听滚动事件
			onScroll(e) {
				this.realScrollTop = e.detail.scrollTop;
			},
			// 刷新数据
			onRefreshData() {
				this.refreshStatus = true;
				this.page = 1;
				this.listData = [];
				this.fetchCommodityList();
			},
			// 加载数据
			onLoadData() {
				if (!this.isHistory && !this.isLoading && this.page < this.pages) {
					this.page += 1;
					this.fetchCommodityList();
				}
			},
			// 返回顶部
			onBackTop() {
				this.scrollTop = this.realScrollTop;
				this.$nextTick(() => {
					this.scrollTop = 0;
				});
			}
		},
		components: {
			Commodity
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
				display: flex;
				flex-direction: row;
				padding: 10rpx;
				box-shadow: 0 0 4px rgba(0, 0, 0, .2);
				background-color: #fff;
				z-index: 2;

				.scan {
					width: 74rpx;
					padding: 3rpx 0;
				}

				.content {
					flex: 1;
					overflow: hidden;
				}
			}

			.container {
				flex: 1;
				height: 100%;
				overflow: hidden;

				.scroll {
					height: 100%;

					.history {
						padding: 16rpx 20rpx calc(env(safe-area-inset-bottom) / 1.5);

						.title {
							display: flex;
							flex-direction: row;

							.text {
								flex: 1;
								padding: 20rpx 0;
								font-size: 28rpx;
								color: #333;
								line-height: 36rpx;
							}

							.action {
								padding: 14rpx;
							}
						}

						.details {

							text {
								display: inline-block;
								margin-bottom: 16rpx;
								margin-right: 20rpx;
								padding: 10rpx 26rpx;
								font-size: 24rpx;
								color: #3c9cff;
								line-height: 32rpx;
								border: 1rpx solid #3c9cff;
								border-radius: 6rpx;
								background-color: #ecf5ff;
							}
						}
					}

					.result {
						padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);
					}
				}
			}
		}
	}
</style>
