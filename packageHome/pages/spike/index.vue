<template>
	<layout>
		<view class="material">
			<scroll-view class="rail" scroll-x="true">
				<view class="option" :class="{active: item.id === activityItem.id}" v-for="item in activityList"
					:key="item.id" @click="onChangeActivity(item)">
					<view class="date">{{item.startDate.substr(0, 10)}}</view>
					<view class="time">{{item.startDate.substr(11, 5)}}</view>
					<view class="status">{{formatActivityStatus(item.status)}}</view>
				</view>
			</scroll-view>
			<view class="limit" v-if="activityList.length">
				<u-count-down :time="limitTime" autoStart @change="onUpdateTime">
					<view class="time">
						<text>距活动{{activityItem.status === 0 ? '开始' : '结束'}}：</text>
						<text class="node">
							{{ timeData.days > 9 ? timeData.days: '0' + timeData.days}}
						</text>
						<text>天</text>
						<text class="node">
							{{ timeData.hours > 9 ? timeData.hours: '0' + timeData.hours}}
						</text>时
						<text class="node">
							{{ timeData.minutes > 9 ? timeData.minutes: '0' + timeData.minutes}}
						</text>分
						<text class="node">
							{{ timeData.seconds > 9 ? timeData.seconds: '0' + timeData.seconds}}
						</text>秒
					</view>
				</u-count-down>
			</view>
			<view v-else class="empty">
				<u-empty mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"></u-empty>
			</view>
		</view>
		<scroll-view slot="bottom" class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
			:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
			:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefreshData"
			@scrolltolower="onLoadData" @scroll="onScroll">
			<view class="container">
				<view class="option" v-for="(item, index) in listData" :key="item.itemNo">
					<view class="picture">
						<u--image :src="$utils.formatPicture(item.picUrl)" :lazyLoad="false" :fade="false"
							width="208rpx" height="208rpx" mode="aspectFit"></u--image>
					</view>
					<view class="info">
						<view class="name">{{item.itemName}}</view>
						<view class="price">
							￥{{$utils.formatValue(item.promotionItemVO.specTransPrice)}}/{{item.unitName}}
							<text>￥{{$utils.formatValue(item.transPrice)}}</text>
						</view>
						<view class="limit">限购：{{parseFloat(item.maxOrderAmt)}}</view>
						<view class="btn" :class="{disabled: activityItem.status !== 1}">
							<view @click="onPlus(item, index)">抢购</view>
						</view>
					</view>
				</view>
				<u-loadmore v-if="listData.length" :status="loadStatus" />
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
				activityList: [],
				activityItem: {},
				limitTime: '',
				timeData: {},
				page: 1,
				size: 20,
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
			this.fetchActivity();
		},
		methods: {
			// 获取活动列表
			fetchActivity() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/promotion/queryActionMSActivity',
					data: {
						current: 1,
						size: 5,
						model: {}
					}
				}).then(res => {
					if (res?.code === 0) {
						const {
							records = []
						} = res.data;
						this.activityList = records;
						if (records.length) {
							this.activityItem = records[0];
							switch (records[0].status) {
								case 0:
									this.limitTime = new Date(records[0].startDate.replace(/-/g, '/'))
										.getTime() - new Date().getTime();
									break;

								case 1:
									this.limitTime = new Date(records[0].endDate.replace(/-/g, '/')).getTime() -
										new Date().getTime();
									break;

								default:
									this.limitTime = '';
									break;
							}
							this.fetchList();
							this.onUpdateActivity();
						} else {
							uni.hideLoading();
						}
					}
				})
			},
			// 获取活动列表
			fetchList() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.isLoading = true;
				this.$request({
					type: "POST",
					url: "/api/order/wechat/promotion/queryPromotionBySheetNo",
					data: {
						current: this.page,
						size: this.size,
						model: {
							sheetNo: this.activityItem.sheetNo,
							wayCode: this.activityItem.wayCode
						}
					}
				}).then(res => {
					this.isLoading = false;
					this.refreshStatus = false;
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
			// 更新活动状态
			onUpdateActivity() {
				const tempList = JSON.parse(JSON.stringify(this.activityList));
				tempList.forEach(item => {
					const nowDate = new Date().getTime();
					const startDate = new Date(item.startDate.replace(/-/g, '/')).getTime();
					const endDate = new Date(item.endDate.replace(/-/g, '/')).getTime();

					if (nowDate < startDate) {
						item.status = 0;
					} else if (nowDate < endDate) {
						item.status = 1;
					} else {
						item.status = 2;
					}
				})
				this.activityList = tempList;
			},
			// 更新倒计时
			onUpdateTime(e) {
				this.timeData = e
			},
			// 切换活动
			onChangeActivity(record) {
				if (record.id === this.activityItem.id) return;
				if (record.status === 0) {
					this.limitTime = new Date(record.startDate.replace(/-/g, '/')).getTime() -
						new Date().getTime();
				} else if (record.status === 1) {
					this.limitTime = new Date(record.endDate.replace(/-/g, '/')).getTime() -
						new Date().getTime();
				} else {
					this.limitTime = '';
				}
				this.page = 1;
				this.listData = [];
				this.activityItem = record;
				this.fetchList();
			},
			// 加购
			onPlus(record, index) {
				this.$utils.onPlusNumber(record)
					.then(number => {
						uni.showModal({
							title: '提示',
							content: '已成功加入购物车',
							showCancel: false
						})
						this.listData[index].itemQty = number;
						this.$utils.updateCache(record, number);
					})
			},
			// 格式化活动状态
			formatActivityStatus(val) {
				return ['未开始', '进行中', '已结束', '已终止'][val];
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
			padding-bottom: 20rpx;
			background-color: #fff;

			.rail {
				width: 100%;
				padding: 20rpx 0;
				white-space: nowrap;

				.option {
					display: inline-block;
					margin-left: 16rpx;
					padding: 20rpx 40rpx;
					color: #333;
					text-align: center;
					border-radius: 12rpx;
					background-color: #f0f0f0;

					.time {
						font-weight: bold;
					}

					&:last-child {
						margin-right: 16rpx;
					}
				}

				.active {
					color: #fff;
					background: linear-gradient(45deg, #f43f3b, #ec008c);
				}
			}

			.limit {
				height: 48rpx;
				padding: 0 20rpx;

				.time {
					color: #333;
					line-height: 48rpx;

					.node {
						margin: 0 4rpx;
						padding: 0 8rpx;
						color: #fff;
						border-radius: 6rpx;
						background-color: #e54d42;
					}
				}
			}

			.empty {
				padding-top: 150rpx;
			}
		}

		.scroll {
			height: 100%;

			.container {
				padding-top: 20rpx;
				padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

				.option {
					display: flex;
					flex-direction: row;
					margin-top: 20rpx;
					padding: 20rpx;
					background-color: #fff;

					.info {
						flex: 1;
						padding-left: 16rpx;

						.name {
							height: 48rpx;
							font-size: 36rpx;
							line-height: 48rpx;
							text-overflow: ellipsis;
							white-space: nowrap;
							overflow: hidden;
						}

						.price {
							height: 44rpx;
							margin-top: 10rpx;
							font-size: 32rpx;
							color: #f50;
							line-height: 44rpx;

							text {
								padding-left: 8rpx;
								font-size: 24rpx;
								color: #999;
								text-decoration: line-through;
							}
						}

						.limit {
							margin-top: 14rpx;
							font-size: 28rpx;
							color: #666;
							line-height: 36rpx;
						}

						.btn {
							overflow: hidden;

							view {
								float: right;
								height: 56rpx;
								padding: 0 40rpx;
								font-size: 24rpx;
								color: #fff;
								line-height: 56rpx;
								border-radius: 12rpx;
								background-color: #e54d42;
							}
						}

						.disabled {

							view {
								background-color: #ddd;
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
</style>
