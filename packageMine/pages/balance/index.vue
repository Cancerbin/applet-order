<template>
	<view>
		<u-sticky offset-top="0">
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
		</u-sticky>
		<view class="list">
			<view v-for="item in listData" :key="item.id">
				<view class="info">
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
		</view>
		<u-empty v-if="!listData.length" mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"
			marginTop="80rpx"></u-empty>
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
			this.fetchBalance();
			this.fetchChangeList();
		},
		onPullDownRefresh() {
			this.page = 1;
			this.fetchBalance();
			this.fetchChangeList();
			setTimeout(() => {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onReachBottom() {
			if (this.page < this.pages) {
				this.page += 1;
				this.fetchChangeList();
			}
		},
		onPageScroll(e) {
			this.scrollTop = e.scrollTop;
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
			fetchChangeList() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
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
			}
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

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

		.list {

			.info {
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
		}
	}
</style>
