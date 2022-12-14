<template>
	<layout>
		<view class="material">
			<view v-for="item in tabList" :key="item.value" :class="{active: tabKey === item.value}"
				@click="onChangeTab(item.value)">{{item.label}}</view>
		</view>
		<scroll-view slot="bottom" class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
			:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
			:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefreshData"
			@scrolltolower="onLoadData" @scroll="onScroll">
			<view class="container">
				<view class="option" v-for="item in listData" :key="item.id">
					<view class="coupon">
						<u--image src="/static/coupon/background.png" :lazyLoad="false" :fade="false" width="170rpx"
							height="180rpx"></u--image>
						<view class="info">
							<view v-if="item.typeModel === '0'">
								<view class="amount">￥<text>{{parseFloat(item.price)}}</text></view>
								<view class="condition">满{{parseFloat(item.conditionPrice)}}元可用</view>
							</view>
							<view v-else class="commodity">商品券</view>
						</view>
					</view>
					<view class="content">
						<view class="info">
							<view class="title">{{item.typeName}}</view>
							<view class="remark">活动内容：{{item.activityContent || '无'}}</view>
						</view>
						<u-line></u-line>
						<view class="limit">使用期限：{{formatLimitDate(item)}}</view>
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
				tabList: [{
						label: '未使用',
						value: '1'
					},
					{
						label: '已使用',
						value: '2'
					},
					{
						label: '已过期',
						value: '3'
					}
				],
				tabKey: '1',
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
			this.fetchList();
		},
		methods: {
			// 获取优惠券列表
			fetchList() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.isLoading = true;
				this.$request({
					type: "POST",
					url: "/api/order/wechat/coupon/bizPage",
					data: {
						current: this.page,
						size: this.size,
						model: {
							status: this.tabKey
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
					this.realScrollTop = 0;
					this.scrollTop = 0;
				});
			},
			// 切换tab
			onChangeTab(key) {
				if (this.tabKey !== key) {
					this.tabKey = key;
					this.page = 1;
					this.onBackTop();
					this.fetchList();
				}
			},
			// 格式化使用期限
			formatLimitDate(record) {
				let text;
				switch (record.validType) {
					case '0':
						text = "永久有效";
						break;

					default:
						text = `${record.startDate.substring(0, 10)} ~ ${record.endDate.substring(0, 10)}`;
						break;
				}
				return text;
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
			display: flex;
			font-size: 28rpx;
			color: #333;
			text-align: center;
			background-color: #fff;
			box-shadow: 0 0 4px rgba(0, 0, 0, .2);
			z-index: 2;

			view {
				flex: 1;
				padding: 28rpx 0;

				&.active {
					position: relative;
					font-weight: bold;
					color: #377cfd;

					&::after {
						content: "";
						position: absolute;
						left: 50%;
						bottom: 0;
						width: 140rpx;
						height: 6rpx;
						background-color: #377cfd;
						transform: translateX(-50%);
					}
				}
			}
		}

		.scroll {
			height: 100%;

			.container {
				padding: 20rpx 20rpx calc(env(safe-area-inset-bottom) / 1.5);

				.option {
					display: flex;
					flex-direction: row;
					margin-top: 20rpx;

					.coupon {
						position: relative;

						.info {
							position: absolute;
							top: 0;
							left: 0;
							width: 170rpx;
							padding: 48rpx 0;
							color: #fff;
							text-align: center;

							.amount {
								height: 48rpx;
								font-size: 24rpx;
								line-height: 48rpx;

								text {
									font-size: 36rpx;
									font-weight: bold;
								}
							}

							.condition {
								height: 36rpx;
								font-size: 24rpx;
								line-height: 36rpx;
							}

							.commodity {
								height: 84rpx;
								font-size: 36rpx;
								line-height: 84rpx;
							}
						}

						&::after {
							content: "";
							position: absolute;
							top: 0;
							right: 0;
							width: 20rpx;
							height: 100%;
							background-color: #fff;
							z-index: -1;
						}
					}

					.content {
						display: flex;
						flex-direction: column;
						flex: 1;
						padding: 0 16rpx;
						background-color: #fff;
						overflow: hidden;

						.info {
							flex: 1;
							height: 100%;
							overflow: hidden;

							.title {
								height: 36rpx;
								padding-top: 10rpx;
								font-size: 28rpx;
								color: #333;
								line-height: 36rpx;
								text-overflow: ellipsis;
								white-space: nowrap;
								overflow: hidden;
							}

							.remark {
								margin-top: 10rpx;
								font-size: 24rpx;
								color: #666;
								line-height: 32rpx;
							}
						}

						.limit {
							height: 32rpx;
							padding: 10rpx 0;
							font-size: 24rpx;
							color: #999;
							line-height: 32rpx;
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
