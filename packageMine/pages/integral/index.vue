<template>
	<view>
		<u-sticky offset-top="0">
			<view class="material">我的积分：{{parseFloat(detail.jifen || 0)}}</view>
		</u-sticky>
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
		</view>
		<u-empty v-if="!listData.length" mode="history" icon="http://cdn.uviewui.com/uview/empty/history.png"
			marginTop="100rpx"></u-empty>
		<u-back-top :scroll-top="scrollTop"></u-back-top>
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
				scrollTop: 0,
				loadStatus: 'loadmore'
			}
		},
		onLoad() {
			this.fetchIntegral();
			this.fetchIntegralRecord();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.fetchIntegral();
			this.fetchIntegralRecord();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onReachBottom() {
			if (this.page < this.pages) {
				this.page += 1;
				this.fetchIntegralRecord();
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
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
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

		.material {
			padding: 20rpx;
			font-size: 28rpx;
			color: #fff;
			background-color: #377CFD;
		}

		.list {

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
</style>
