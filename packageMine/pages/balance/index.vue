<template>
	<layout>
		<view class="material">
			<view class="balance">
				<u-row>
					<u-col span="4">
						<view class="title">账户总额(元)</view>
						<view class="amount">{{$utils.formatValue(detail.totalAmount)}}</view>
					</u-col>
					<u-col span="4">
						<view class="title">可用账户余额(元)</view>
						<view class="amount">{{$utils.formatValue(detail.availableAmount)}}</view>
					</u-col>
					<u-col span="4">
						<view class="title">冻结余额(元)</view>
						<view class="amount">{{$utils.formatValue(detail.frozenAmount)}}</view>
					</u-col>
				</u-row>
			</view>
			<view class="tab">
				<u-row>
					<u-col span="6">
						<view class="column">
							<text class="active">变更记录</text>
						</view>
					</u-col>
					<u-col span="6">
						<view class="column">
							<text>授信明细</text>
						</view>
					</u-col>
				</u-row>
			</view>
		</view>
		<scroll-view slot="bottom" class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
			:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
			:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefreshData"
			@scrolltolower="onLoadData" @scroll="onScroll">
			<view class="container">
				<view v-for="item in listData" :key="item.id">
					<view class="option">
						<view class="main">
							<view class="remark">{{item.remarkInfo || ''}}</view>
							<view class="amount">{{$utils.formatValue(item.changeAmount)}}</view>
						</view>
						<u-row>
							<u-col span="6">
								<view class="sheet">{{item.relateOrderNo}}</view>
							</u-col>
							<u-col span="6">
								<view class="time">{{item.createTime}}</view>
							</u-col>
						</u-row>
					</view>
					<u-line></u-line>
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
		onLoad() {
			this.fetchBalance();
			this.fetchList();
		},
		methods: {
			// 获取余额
			fetchBalance() {
				this.$request({
					type: 'POST',
					url: `/api/authority/orgAccountApi/getByBranchNo?branchNo=${uni.getStorageSync('branchNo')}`
				}).then(res => {
					if (res?.code == 0) {
						this.detail = res.data;
					}
				})
			},
			// 获取变更记录
			fetchList() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.isLoading = true;
				this.$request({
					type: "POST",
					url: "/api/authority/orgAccountApi/changeRecord/bizPage",
					data: {
						current: this.page,
						size: this.size,
						model: {
							branchNo: uni.getStorageSync('branchNo')
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
				this.fetchBalance();
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
			color: #fff;
			background-color: #377cfd;

			.balance {
				padding: 20rpx 0;

				.title {
					font-size: 24rpx;
					text-align: center;
				}

				.amount {
					margin-top: 12rpx;
					text-align: center;
				}
			}

			.tab {
				background-color: rgba(255, 255, 255, .5);

				.column {
					padding: 8rpx 0;
					text-align: center;

					text {
						display: inline-block;
						padding: 20rpx 8rpx 16rpx;
						color: rgba(255, 255, 255, .6);
						border-bottom: 4rpx solid transparent;

						&.active {
							color: #fff;
							border-color: #f1f1f1;
						}
					}
				}
			}
		}

		.scroll {
			height: 100%;

			.container {
				padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

				.option {
					padding: 20rpx;
					background-color: #fff;

					.main {
						display: flex;
						flex-direction: row;

						.remark {
							flex: 1;
						}

						.amount {
							width: 200rpx;
							text-align: right;
						}
					}

					.sheet {
						font-size: 24rpx;
						color: #999;
					}

					.time {
						font-size: 24rpx;
						color: #999;
						text-align: right;
					}
				}

				.empty {
					padding-top: 100rpx;
				}
			}
		}
	}
</style>
