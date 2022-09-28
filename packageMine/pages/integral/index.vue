<template>
	<layout>
		<view class="material">我的积分：{{parseFloat(detail.jifen || 0)}}</view>
		<scroll-view slot="bottom" class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
			:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
			:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefreshData"
			@scrolltolower="onLoadData" @scroll="onScroll">
			<view class="container">
				<view v-for="item in listData" :key="item.id">
					<view class="option">
						<view class="title">
							<view>{{formatText(item.changeType)}}</view>
							<view>{{item.createTime}}</view>
						</view>
						<view class="change">{{formatIntegral(item.changeJifen)}}</view>
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
			// 获取积分记录
			fetchList() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.isLoading = true;
				this.$request({
					type: "POST",
					url: "/api/order/wechat/jifen/bizPageForRecord",
					data: {
						current: this.page,
						size: this.size,
						model: {}
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
				this.fetchIntegral();
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
			// 格式化积分类型
			formatText(type) {
				return ['', '登录领取积分', '下单奖励积分', '兑换商品'][type]
			},
			// 格式化积分
			formatIntegral(val) {
				const value = parseFloat(val);
				return `${value >= 0 ? '+' : ''}${value}`;
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
			padding: 20rpx;
			font-size: 28rpx;
			color: #fff;
			background-color: #377CFD;
		}

		.scroll {
			height: 100%;

			.container {
				padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

				.option {
					padding: 20rpx;
					background-color: #fff;

					.title {
						display: flex;
						flex-direction: row;
						line-height: 36rpx;

						view {
							flex: 1;

							&:last-child {
								font-size: 24rpx;
								color: #666;
								text-align: right;
							}
						}
					}

					.change {
						margin-top: 10rpx;
						text-align: right;
					}
				}

				.empty {
					padding-top: 150rpx;
				}
			}
		}
	}
</style>
