<template>
	<view class="layout">
		<view class="material">我的积分：{{parseFloat(detail.jifen || 0)}}</view>
		<view class="container">
			<scroll-view class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
				:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
				:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefreshData"
				@scrolltolower="onLoadData" @scroll="onScroll">
				<view class="list">
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
					<u-empty v-if="!listData.length" mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"
						marginTop="100rpx"></u-empty>
				</view>
			</scroll-view>
		</view>
		<u-back-top :scroll-top="realScrollTop" @click="onBackTop"></u-back-top>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				detail: {},
				page: 1,
				size: 50,
				pages: 1,
				listData: [],
				isLoading: false,
				scrollTop: 0,
				realScrollTop: 0,
				refreshStatus: false,
				loadStatus: 'loadmore'
			}
		},
		onLoad() {
			this.fetchIntegral();
			this.fetchIntegralRecord();
		},
		methods: {
			// 获取积分
			fetchIntegral() {
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/jifen/query',
				}).then(res => {
					if (res?.code == 0) {
						this.detail = res.data;
					}
				})
			},
			// 获取积分记录
			fetchIntegralRecord() {
				this.isLoading = true;
				uni.showLoading({
					title: "加载中",
					mask: true
				})
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
				this.listData = [];
				this.fetchIntegral();
				this.fetchIntegralRecord();
			},
			// 加载数据
			onLoadData() {
				if (!this.isLoading && this.page < this.pages) {
					this.page += 1;
					this.fetchIntegralRecord();
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
				padding: 20rpx;
				font-size: 28rpx;
				color: #fff;
				background-color: #377CFD;
			}

			.container {
				flex: 1;
				height: 100%;
				overflow: hidden;

				.scroll {
					height: 100%;

					.list {
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
					}
				}
			}
		}
	}
</style>
