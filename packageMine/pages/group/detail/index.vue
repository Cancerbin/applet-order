<template>
	<view>
		<view class="material">
			<view class="banner">
				<u-image :src="$utils.formatPicture(detail.picUrl)" :lazyLoad="false" :fade="false" mode="aspectFit"
					width="710rpx" height="600rpx">
				</u-image>
			</view>
			<u-line></u-line>
			<view class="info">
				<view class="title">
					<text class="tag">团购</text>
					<text>{{detail.itemName}}</text>
				</view>
				<view class="base">货号：{{detail.itemNo}}</view>
				<view class="base">商品条码：{{detail.itemSubno}}</view>
				<view class="price">
					<text>￥{{formatSpecTransPrice()}}/{{detail.unitName}}</text>
					<text class="special">￥{{formatAmount(detail.transPrice)}}</text>
				</view>
			</view>
		</view>
		<!-- 商品详情 -->
		<view class="card">
			<view class="title">商品详情</view>
			<u-line></u-line>
			<view class="content">
				<u-row>
					<u-col span="6">
						<view>商品规格：{{detail.itemSize||'无'}}</view>
					</u-col>
					<u-col span="6">
						<view>活动数量：{{formatActivityNumber()}}</view>
					</u-col>
				</u-row>
				<u-row customStyle="margin-top: 16rpx">
					<u-col span="6">
						<view>限购数量：{{parseFloat(detail.maxOrderAmt || 0)}}</view>
					</u-col>
					<u-col span="6">
						<view>已售数量：{{formatSaleNumber()}}
						</view>
					</u-col>
				</u-row>
			</view>
		</view>
		<view class="footer">
			<view class="action">
				<view class="reduce" @click="onReduce">
					<u-image src="/static/commodity/icon_reduce.png" width="48rpx" height="48rpx">
					</u-image>
				</view>
				<view class="number">
					<u--input type="number" inputAlign="center" v-model="number" @blur="onUpdateNumber"></u--input>
				</view>
				<view class="plus" @click="onPlus">
					<u-image src="/static/commodity/icon_plus.png" width="48rpx" height="48rpx">
					</u-image>
				</view>
			</view>
			<view class="count">￥{{formatPayAmount()}}</view>
			<view class="pay" @click="onSubmitPay">去支付</view>
		</view>

		<!-- 支付弹窗 -->
		<recharge v-if="rechargeModalVisible" :payAmt="formatPayAmount()" sheetNo="custom"
			@onReult="onRechargeResult" />
	</view>
</template>

<script>
	import recharge from '@/components/recharge/index.vue';
	export default {
		data() {
			return {
				detail: {},
				realNumber: 1,
				number: 1,
				rechargeModalVisible: false
			}
		},
		onLoad(options) {
			this.detail = JSON.parse(decodeURIComponent(options.detail));
		},
		methods: {
			// 减少数量
			onReduce() {
				const number = this.number - 1;
				if (number) {
					this.number = number;
					this.realNumber = number;
				} else {
					uni.showModal({
						title: '提示',
						content: '最小购买数量为1',
						showCancel: false
					});
				}
			},
			// 添加数量
			onPlus() {
				const number = this.number + 1;
				if (number <= parseFloat(this.detail.maxOrderAmt)) {
					if (number <= (this.formatActivityNumber() - this.formatSaleNumber())) {
						this.number = number;
						this.realNumber = number;
					} else {
						uni.showModal({
							title: '提示',
							content: '不能超过活动剩余总数量',
							showCancel: false
						});
					}
				} else {
					uni.showModal({
						title: '提示',
						content: '不能超过限购数量',
						showCancel: false
					});
				}
			},
			// 修改数量
			onUpdateNumber() {
				const number = this.number || 0;
				if (number) {
					if (number <= parseFloat(this.detail.maxOrderAmt)) {
						if (number <= (this.formatActivityNumber() - this.formatSaleNumber())) {
							this.number = number;
							this.realNumber = number;
						} else {
							this.number = this.realNumber;
							uni.showModal({
								title: '提示',
								content: '不能超过活动剩余总数量',
								showCancel: false
							});
						}
					} else {
						this.number = this.realNumber;
						uni.showModal({
							title: '提示',
							content: '不能超过限购数量',
							showCancel: false
						});
					}
				} else {
					this.number = this.realNumber;
					uni.showModal({
						title: '提示',
						content: '数量不能为空',
						showCancel: false
					});
				}
			},
			// 提交支付
			onSubmitPay() {
				uni.showModal({
					title: '提示',
					content: '是否确认支付？',
					success: (res) => {
						if (res?.confirm) {
							uni.showLoading({
								title: "支付中",
								mask: true
							})
							this.onPay();
						}
					}
				})
			},
			// 支付
			onPay() {
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/groupBuy/buyGroupCoupon',
					data: {
						branchNo: uni.getStorageSync('branchNo'),
						transBranchNo: uni.getStorageSync('transBranchNo'),
						promotionSheetNo: this.detail.promotionItemVO.promotionSheetNo,
						count: this.number,
						couponTypeCode: this.detail.promotionItemVO.couponTypeCode
					},
					intercept: false
				}).then(res => {
					uni.hideLoading();
					if (res?.code === 0) {
						uni.showToast({
							title: '支付成功',
							success: () => {
								setTimeout(() => {
									uni.navigateBack()
								}, 2000)
							}
						})
					} else if (res.code === -100) {
						uni.showModal({
							title: '提示',
							content: '当前余额不足，是否充值支付？',
							success: (result) => {
								if (result.confirm) {
									this.rechargeModalVisible = true;
								} else {
									uni.showToast({
										icon: "error",
										title: "支付失败",
										mask: true,
										duration: 2000
									});
								}
							}
						})
					} else {
						uni.showToast({
							icon: "error",
							title: "支付失败",
							mask: true,
							duration: 2000
						});
					}
				})
			},
			// 获取充值结果
			onRechargeResult(type) {
				this.rechargeModalVisible = false;
				switch (type) {
					case 'cancel':
						uni.showToast({
							icon: "error",
							title: "取消充值",
							mask: true,
							duration: 2000
						});
						break;

					case 'fail':
						uni.showToast({
							icon: "error",
							title: "充值失败",
							mask: true,
							duration: 2000
						});
						break;

					case 'success':
						uni.showToast({
							icon: "success",
							title: "支付成功",
							mask: true,
							duration: 2000
						});
						break;

					default:
						break;
				}
			},
			// 格式化活动数量
			formatActivityNumber() {
				return parseFloat(this.detail.promotionItemVO ? (this.detail.promotionItemVO.promotionQuantity || 0) : 0);
			},
			// 格式化已售数量
			formatSaleNumber() {
				return parseFloat(this.detail.promotionItemVO ? (this.detail.promotionItemVO.sellQuantity || 0) : 0);
			},
			// 格式化特价
			formatSpecTransPrice() {
				return this.formatAmount(this.detail.promotionItemVO ? this.detail.promotionItemVO.specTransPrice :
					this.detail.transPrice);
			},
			// 格式化金额
			formatAmount(val) {
				return this.$utils.formatValue(val);
			},
			// 格式化支付金额
			formatPayAmount() {
				const number = this.number || 1;
				const price = this.formatSpecTransPrice();
				return this.formatAmount(price * number);
			}
		},
		components: {
			recharge
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(124rpx + env(safe-area-inset-bottom) / 1.5);

		.material {
			padding: 0 20rpx;
			background-color: #fff;

			.banner {
				padding: 20rpx 0;
			}

			.info {
				padding-top: 20rpx;
				padding-bottom: 16rpx;

				.title {
					font-size: 28rpx;
					font-weight: bold;
					color: #333;
					line-height: 48rpx;
					word-break: break-all;

					.tag {
						display: inline-block;
						margin-right: 10rpx;
						padding: 0 12rpx;
						font-size: 20rpx;
						font-weight: normal;
						color: #fff;
						border-radius: 6rpx;
						background-color: #F6992E;
					}
				}

				.base {
					margin-top: 12rpx;
					font-size: 24rpx;
					color: #999;
					line-height: 32rpx;
				}

				.price {
					margin-top: 10rpx;
					font-size: 32rpx;
					color: #f50;
					line-height: 48rpx;

					.special {
						padding-left: 8rpx;
						font-size: 22rpx;
						color: #999;
						text-decoration: line-through;
					}
				}
			}
		}

		.card {
			margin-top: 20rpx;
			padding: 20rpx;
			background-color: #fff;

			.title {
				position: relative;
				height: 36rpx;
				padding-bottom: 20rpx;
				font-size: 28rpx;
				font-weight: bold;
				color: #333;
				line-height: 36rpx;

				&::after {
					position: absolute;
					top: 0;
					left: -20rpx;
					content: "";
					width: 6rpx;
					height: 36rpx;
					background-color: #377cfd;
				}
			}

			.content {
				padding-top: 20rpx;
				font-size: 28rpx;
				color: #999;
				line-height: 36rpx;
			}
		}

		.footer {
			position: fixed;
			left: 0;
			bottom: 0;
			display: flex;
			flex-direction: row;
			width: 100%;
			padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);
			box-shadow: 0 0 3rpx rgba(0, 0, 0, .2);
			background-color: #fff;

			.action {
				display: flex;
				flex-direction: row;
				height: 104rpx;
				overflow: hidden;

				.plus,
				.reduce {
					width: 48rpx;
					height: 48rpx;
					padding: 28rpx;
				}

				.number {
					width: 100rpx;
					padding-top: 16rpx;
					border-bottom: 1rpx solid #377cfd;
				}
			}

			.count {
				flex: 1;
				padding-right: 20rpx;
				font-size: 32rpx;
				font-weight: bold;
				color: #f50;
				line-height: 104rpx;
				text-align: right;
			}

			.pay {
				width: 200rpx;
				color: #fff;
				line-height: 104rpx;
				text-align: center;
				background-color: #f50;
			}
		}
	}
</style>
