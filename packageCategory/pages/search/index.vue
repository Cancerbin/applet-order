<template>
	<layout>
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
		<scroll-view slot="bottom" class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
			:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
			:scroll-with-animation="true" :refresher-enabled="!isHistory" @refresherrefresh="onRefreshData"
			@scrolltolower="onLoadData" @scroll="onScroll">
			<view class="container">
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
					<view v-else class="empty">
						<u-empty mode="history" icon="http://cdn.uviewui.com/uview/empty/history.png"></u-empty>
					</view>
				</view>
				<view v-else>
					<view v-for="(item, index) in listData" :key="item.id">
						<commodity :detail="item" :index="index" @onModify="this.onModifyNumber"
							@onClick="this.onViewCommodity" />
						<u-line></u-line>
					</view>
					<u-loadmore v-if="listData.length" :status="loadStatus" />
					<view v-else class="empty">
						<u-empty mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"></u-empty>
					</view>
				</view>
			</view>
		</scroll-view>
		<u-back-top :scroll-top="realScrollTop" @click="onBackTop"></u-back-top>
	</layout>
</template>

<script>
	import layout from '@/components/layout/index.vue';
	import commodity from '@/components/commodity/index.vue';
	export default {
		data() {
			return {
				isHistory: true,
				searchList: [],
				page: 1,
				size: 20,
				pages: 1,
				listData: [],
				itemInfo: '',
				condition: '',
				refreshStatus: false,
				isLoading: false,
				loadStatus: 'loadmore',
				scrollTop: 0,
				realScrollTop: 0
			}
		},
		onLoad(options) {
			this.searchList = uni.getStorageSync('searchCache') || [];
			if (options?.scan === 'true') {
				this.onScan();
			}
		},
		methods: {
			// 获取变更记录
			fetchList() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.isLoading = true;
				this.$request({
					type: "POST",
					url: "/api/order/wechat/item/bizPageForDelivery",
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
				if (!this.isHistory && !this.isLoading && this.page < this.pages) {
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
			// 扫码事件
			onScan() {
				uni.scanCode({
					scanType: ['barCode'],
					success: res => {
						this.isHistory = false;
						this.condition = res.result;
						this.fetchList();
					}
				})
			},
			// 查询事件
			onSearch() {
				if (this.itemInfo === this.condition) {
					return;
				}
				this.isHistory = false;
				this.itemInfo = this.condition.trim();
				this.page = 1;
				this.listData = [];
				this.fetchList();
			},
			// 取消事件
			onCancel() {
				this.isHistory = true;
				this.condition = '';
				this.itemInfo = '';
				this.listData = [];
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
			// 快捷查询
			onQuickSearch(text) {
				this.condition = text;
				this.onSearch();
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
			}
		},
		components: {
			layout,
			commodity
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		overflow: hidden;

		.search {
			position: relative;
			display: flex;
			flex-direction: row;
			padding: 10rpx;
			background-color: #fff;
			box-shadow: 0 0 4px rgba(0, 0, 0, .2);
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

		.scroll {
			height: 100%;

			.container {
				padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

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

				.empty {
					padding-top: 100rpx;
				}
			}
		}
	}
</style>
