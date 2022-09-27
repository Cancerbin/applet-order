<template>
	<view>
		<u-sticky offset-top="0">
			<u-subsection :list="tabList" :current="tabIndex" fontSize="16" :bold="false" @change="onChangeTab"
				bgColor="#e8e8e8">
			</u-subsection>
		</u-sticky>
		<view class="container">
			<view v-if="tabIndex === 0">
				<!-- 订单信息 -->
				<view class="card">
					<view class="header">
						<view class="title">订单信息</view>
						<view class="extra">
							<u-text size="14" :type="formatOrderStatus" :text="formatOrderText" align="right"></u-text>
						</view>
					</view>
					<view class="details">
						<view class="label">要货单号</view>
						<view class="content">{{detail.sheetNo}}</view>
					</view>
					<view class="details">
						<view class="label">支付方式</view>
						<view class="content">{{formatPayType}}</view>
					</view>
					<view class="details">
						<view class="label">提交时间</view>
						<view class="content">{{detail.createTime}}</view>
					</view>
				</view>
				<!-- 卡券信息 -->
				<view class="card" v-if="formatCouponShowState">
					<view class="header">
						<view class="title">卡券信息</view>
					</view>
					<view class="coupon" v-if="detail.moneyCouponList && detail.moneyCouponList.length"
						v-for="item in detail.moneyCouponList">
						<view class="tag">现金券</view>
						<view class="text">满{{formatAmount(item.conditionPrice)}}元减{{formatAmount(item.price)}}元
						</view>
					</view>
					<view class="coupon" v-if="detail.itemCouponList && detail.itemCouponList.length"
						v-for="item in detail.itemCouponList">
						<view class="tag">商品券</view>
						<view class="text">商品【{{item.itemName}}】x {{parseFloat(item.count)}}</view>
					</view>
				</view>
				<!-- 付款信息 -->
				<view class="card">
					<view class="header">
						<view class="title">付款信息</view>
					</view>
					<view class="details">
						<view class="label">商品总价</view>
						<view class="content">￥{{formatAmount(detail.sheetAmt)}}</view>
					</view>
					<view class="details" v-if="parseFloat(detail.allReduceAmt) > 0">
						<view class="label">满减金额</view>
						<view class="content">￥{{formatAmount(detail.allReduceAmt)}}</view>
					</view>
					<view class="details" v-if="parseFloat(detail.couponAmt) > 0">
						<view class="label">券抵扣金额</view>
						<view class="content">￥{{formatAmount(detail.couponAmt)}}</view>
					</view>
					<view class="details" v-if="parseFloat(detail.promotionAmt) > 0">
						<view class="label">优惠金额</view>
						<view class="content">￥{{formatAmount(detail.promotionAmt)}}</view>
					</view>
					<view class="details">
						<view class="label">配送费</view>
						<view class="content">￥{{formatAmount(detail.deliveryFeeAmt)}}</view>
					</view>
					<view class="details">
						<view class="label">服务费</view>
						<view class="content">￥{{formatAmount(detail.serviceFeeAmt)}}</view>
					</view>
					<view class="details">
						<view class="label">商品数量</view>
						<view class="content">{{formatQuantity(detail.itemQty)}}</view>
					</view>
					<view class="details" v-if="parseFloat(detail.allGiftCount) > 0">
						<view class="label">满赠数量</view>
						<view class="content">{{formatQuantity(detail.allGiftCount)}}</view>
					</view>
					<view class="details">
						<view class="label">{{detail.isPaid === 1 ? '实':'应'}}付金额</view>
						<view class="content mark">￥{{formatAmount(detail.payAmt)}}</view>
					</view>
				</view>
				<!-- 工具栏 -->
				<view class="toolbar">
					<view class="item" v-if="detail.detailsVOList">
						<view class="btn view" @click="onViewCommodity">查看商品信息</view>
					</view>
					<view class="item" v-if="detail.status === 0">
						<view class="between" v-if="detail.isPaid === 0">
							<view class="left">
								<view class="btn primary" @click="onSubmitCancel">取消订单</view>
							</view>
							<view class="right">
								<view class="btn primary" @click="onSubmitPay">去支付</view>
							</view>
						</view>
						<view class="btn primary" v-else @click="onSubmitAppeal">申诉</view>
					</view>
					<view class="item" v-if="detail.status === 1">
						<view class="btn primary" @click="onSubmitCancel">取消订单</view>
					</view>
					<view class="item" v-if="detail.status > 1">
						<view class="btn primary" @click="onReorder">重下此单</view>
					</view>
				</view>
			</view>
			<view v-else>
				<view class="timeline" v-for="(item, index) in listData" :key="item.id">
					<view class="time">{{item.createTime}}</view>
					<view class="node">
						<view class="dot"></view>
						<view class="topline" v-if="index > 0"></view>
						<view class="bottomline" v-if="index < listData.length - 1"></view>
					</view>
					<view class="info">
						<u--text :text="item.title" size="24rpx" color="#666"></u--text>
						<u--text v-if="item.memo" :text="item.memo" size="24rpx" color="#666"></u--text>
					</view>
				</view>
			</view>
		</view>

		<!-- 支付弹窗 -->
		<u-modal :show="payModalVisible" :showCancelButton="true" title="订单支付" @confirm="onPay" @cancel="onCloseModal">
			<view class="modal">
				<view class="amount">￥{{formatAmount(detail.payAmt)}}</view>
				<view class="content">
					<view v-for="item in paymentList" :key="item.type">
						<u-line></u-line>
						<view class="column" @click="onChangePayment(item.type)">
							<view class="picture">
								<u-image width="36rpx" height="36rpx" :src="item.url"></u-image>
							</view>
							<view class="text">
								{{item.text}}
								<text v-if="item.type === 'cz'">(余额：￥{{formatAmount(balance)}})</text>
							</view>
							<view class="check">
								<u--image :src="formatCheck(item.type)" width="40rpx" height="40rpx"></u--image>
							</view>
						</view>
					</view>
					<u-line></u-line>
				</view>
			</view>
		</u-modal>

		<!-- 支付弹窗 -->
		<recharge v-if="rechargeModalVisible" :payAmt="formatAmount(detail.payAmt)" :sheetNo="sheetNo"
			@onReult="onRechargeResult" />
	</view>
</template>

<script>
	import recharge from '@/components/recharge/index.vue';
	export default {
		data() {
			return {
				sheetNo: '',
				tabList: ['订单详情', '订单状态'],
				tabIndex: 0,
				detail: {},
				listData: [],
				balance: 0,
				paymentList: [{
						type: 'cz',
						url: '/static/cart/icon_cz.png',
						text: '储值支付',
					},
					{
						type: 'wx',
						url: '/static/cart/icon_wx.png',
						text: '微信支付',
					}
				],
				paymentType: 'cz',
				payModalVisible: false,
				rechargeModalVisible: false
			}
		},
		onLoad(options) {
			this.sheetNo = options.sheetNo;
			this.fetchDetail();
		},
		methods: {
			// 获取订单详情
			fetchDetail() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					url: `/api/order/wechat/pmEnquiryMaster/getBySheetNo/${this.sheetNo}`
				}).then(res => {
					if (res?.code === 0) {
						this.detail = res.data;
						uni.hideLoading();
					}
				})
			},
			// 获取订单状态
			fetchSheetState() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/pmEnquiryLog/listBySheetNo',
					data: {
						sheetNo: this.sheetNo
					}
				}).then(res => {
					if (res?.code === 0) {
						this.listData = res.data;
						uni.hideLoading();
					}
				})
			},
			// 获取余额
			fetchBalance() {
				this.$request({
					type: 'POST',
					url: `/api/authority/orgAccountApi/getByBranchNo?branchNo=${uni.getStorageSync('branchNo')}`,
				}).then(res => {
					if (res?.code == 0) {
						this.balance = parseFloat(res.data.availableAmount || 0);
					}
				})
			},
			// 获取支付结果
			fetchPaymentResult() {
				this.$utils.onInquirePaymentResult(this.sheetNo)
					.then(() => {
						uni.showToast({
							icon: "success",
							title: '支付成功',
							mask: true,
							duration: 2000,
							success: () => {
								this.payModalVisible = false;
							}
						})
						setTimeout(() => {
							this.fetchDetail();
						}, 2000)
					})
					.catch((error) => {
						uni.showToast({
							icon: "fail",
							title: '支付失败',
							mask: true,
							duration: 2000
						})
					})
			},
			// 取消订单
			onCancel() {
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/pmEnquiryMaster/cancelEnquiryMaster',
					data: {
						branchNo: uni.getStorageSync('branchNo'),
						sheetNo: this.sheetNo
					}
				}).then(res => {
					if (res?.code == 0) {
						uni.hideLoading();
						this.fetchDetail();
					}
				})
			},
			// 切换tab
			onChangeTab(key) {
				this.tabIndex = key;
				if (key === 1) {
					this.fetchSheetState();
				}
			},
			// 查看商品信息
			onViewCommodity() {
				uni.navigateTo({
					url: `/packageMine/pages/order/detail/commodity?list=${encodeURIComponent(JSON.stringify(this.detail.detailsVOList))}`
				})
			},
			// 提交取消订单
			onSubmitCancel() {
				uni.showModal({
					title: '提示',
					content: '是否确认取消此订单？',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: "取消中",
								mask: true
							})
							this.onCancel();
						}
					}
				})
			},
			// 支付订单
			onSubmitPay() {
				this.fetchBalance();
				this.payModalVisible = true;
			},
			// 申诉订单
			onSubmitAppeal() {
				uni.showModal({
					title: '提示',
					content: '是否确定申诉该订单？',
					success: (result) => {
						if (result.confirm) {
							uni.showLoading({
								title: "申诉中",
								mask: true
							})
							this.$utils.onStoredValuePayment(this.sheetNo, true)
								.then(() => {
									uni.showToast({
										icon: "success",
										title: '申诉成功',
										mask: true,
										duration: 2000
									})
									setTimeout(() => {
										this.fetchDetail();
									}, 2000)
								})
						}
					}
				})
			},
			// 重下订单
			onReorder() {
				uni.showModal({
					title: '提示',
					content: '是否确认把订单商品加入购物车？',
					success: (result) => {
						if (result.confirm) {
							uni.showLoading({
								title: '加载中',
								mask: true
							})
							this.$request({
								url: '/api/order/wechat/shopCart/reorderByNoNew',
								type: 'POST',
								data: {
									sheetNo: this.sheetNo
								}
							}).then(res => {
								if (res?.code === 0) {
									uni.showToast({
										icon: "success",
										title: '成功加入',
										mask: true,
										duration: 2000
									})
									res.data.forEach(item => {
										let number = parseFloat(item.reorderCount);
										delete item.reorderCount;
										this.$utils.updateCache(item, number);
									})
								}
							})
						}
					}
				});
			},
			// 选择支付方式
			onChangePayment(type) {
				this.paymentType = type;
			},
			// 关闭弹窗
			onCloseModal() {
				this.payModalVisible = false;
			},
			// 支付
			onPay() {
				uni.showModal({
					title: '提示',
					content: '是否确定支付该订单？',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: "支付中",
								mask: true
							})
							if (this.paymentType === 'cz') {
								this.onStoredValuePayment();
							} else {
								this.onWxPayment();
							}
						}
					}
				})
			},
			// 储值支付
			onStoredValuePayment() {
				this.$utils.onStoredValuePayment(this.sheetNo)
					.then(() => {
						uni.showToast({
							icon: "success",
							title: '支付成功',
							mask: true,
							duration: 2000,
							success: () => {
								this.payModalVisible = false;
							}
						})
						setTimeout(() => {
							this.fetchDetail();
						}, 2000)
					})
					.catch(error => {
						if (error.code === -100) {
							uni.showModal({
								title: '提示',
								content: '当前余额不足，是否充值支付？',
								success: (result) => {
									if (result.confirm) {
										this.payModalVisible = false;
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
			// 微信支付
			onWxPayment() {
				this.$utils.onWxPayment({
						sheetNo: this.sheetNo
					})
					.then(() => {
						this.fetchPaymentResult();
					})
					.catch(() => {
						uni.showToast({
							icon: 'error',
							title: '支付失败',
							mask: true,
							duration: 2000
						})
					});
			},
			// 获取充值结果
			onRechargeResult(type) {
				this.rechargeModalVisible = false;
				switch (type) {
					case 'cancel':
						uni.showToast({
							icon: 'error',
							title: '充值失败',
							mask: true,
							duration: 2000
						})
						break;

					case 'fail':
						uni.showToast({
							icon: 'error',
							title: '支付失败',
							mask: true,
							duration: 2000
						})
						break;

					case 'fail':
						uni.showToast({
							icon: "success",
							title: '支付成功',
							mask: true,
							duration: 2000
						})
						setTimeout(() => {
							this.fetchDetail();
						}, 2000)
						break;

					default:
						break;
				}
			},
			// 格式化金额
			formatAmount(value) {
				return this.$utils.formatValue(value);
			},
			// 格式化数量
			formatQuantity(value) {
				return this.$utils.formatValue(value, 'quantity');
			},
			// 格式化付款方式选中状态
			formatCheck(type) {
				return `/static/cart/icon_${type === this.paymentType ? '' : 'un'}checked.png`;
			}
		},
		computed: {
			// 格式化订单状态
			formatOrderStatus() {
				return ['error', 'primary', 'primary', 'info', '', 'success'][this.detail.status];
			},
			// 格式化订单描述
			formatOrderText() {
				let text = '';
				switch (this.detail.status) {
					case 0:
						text = this.detail.isPaid === 0 ? "待付款" : "支付异常";
						break;

					case 1:
						text = "订单确认";
						break;

					case 2:
						text = "待收货";
						break;

					case 3:
						text = "已取消";
						break;

					case 5:
						text = "已完成";
						break;

					default:
						break;
				}
				return text;
			},
			// 格式化支付方式
			formatPayType() {
				return this.detail.payType ? ['', '货到付款', '在线支付', '储值支付', '积分支付'][this.detail.payType] : '-'
			},
			// 格式化卡券信息展示状态
			formatCouponShowState() {
				return this.detail?.moneyCouponList?.length || this.detail?.itemCouponList?.length;
			}
		},
		components: {
			recharge
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

		.u-subsection--button {
			height: 100rpx !important;
			padding: 16rpx 20rpx !important;
		}

		.container {
			padding: 0 20rpx 20rpx;

			.card {
				margin-top: 20rpx;
				padding: 20rpx;
				border-radius: 12rpx;
				background-color: #fff;

				.header {
					display: flex;
					flex-direction: row;

					.title {
						flex: 1;
					}

					.extra {
						width: 200rpx;
					}
				}

				.details {
					display: flex;
					flex-direction: row;
					height: 36rpx;
					margin-top: 20rpx;
					font-size: 24rpx;
					color: #666;
					line-height: 36rpx;

					.label {
						width: 200rpx;
					}

					.content {
						flex: 1;
						text-align: right;
					}

					.mark {
						font-size: 32rpx;
						color: #f50;
					}
				}


				.coupon {
					display: flex;
					margin-top: 20rpx;

					.tag {
						width: 100rpx;
						height: 48rpx;
						font-size: 24rpx;
						color: #fff;
						line-height: 48rpx;
						text-align: center;
						border-radius: 12rpx;
						background-color: #f56c6c;
					}

					.text {
						flex: 1;
						padding-left: 16rpx;
						font-size: 24rpx;
						color: #999;
						line-height: 48rpx;
					}
				}
			}

			.toolbar {

				.item {
					margin-top: 20rpx;

					.between {
						display: flex;
						flex-direction: row;

						.left {
							width: 345rpx;
						}

						.right {
							width: 345rpx;
							padding-left: 20rpx;
						}
					}

					.btn {
						padding: 24rpx 0;
						font-size: 24rpx;
						text-align: center;
						border-radius: 12rpx;
					}

					.view {
						color: #377CFD;
						box-shadow: 0 3rpx 3rpx rgba(0, 0, 0, .1);
						background-color: #fff;
					}

					.primary {
						color: #fff;
						background: linear-gradient(to bottom, #88b1ff, #377cfd);
					}
				}
			}

			.timeline {
				display: flex;
				font-size: 24rpx;
				color: #666;

				.time {
					width: 160rpx;
					padding-top: 30rpx;
					text-align: center;
				}

				.node {
					position: relative;
					width: 25rpx;
					padding: 50rpx 20rpx 0;

					.dot {
						width: 25rpx;
						height: 25rpx;
						border-radius: 12rpx;
						background-color: #999;
					}

					.topline {
						position: absolute;
						top: 0;
						left: 50%;
						width: 2rpx;
						height: 50rpx;
						background-color: #999;
						transform: translateX(-50%);
					}

					.bottomline {
						position: absolute;
						top: 50rpx;
						left: 50%;
						width: 2rpx;
						height: calc(100% - 50rpx);
						background-color: #999;
						transform: translateX(-50%);
					}
				}

				.info {
					flex: 1;
					padding-top: 46rpx;
					padding-left: 8rpx;

					.u-text__value {
						word-break: break-all;
					}
				}
			}
		}

		.modal {
			width: 100%;

			.amount {
				font-size: 40rpx;
				font-weight: bold;
				color: #f50;
				text-align: center;
			}

			.content {
				margin-top: 50rpx;

				.column {
					display: flex;
					flex-direction: row;
					padding: 20rpx;

					.picture {
						width: 48rpx;
						padding: 4rpx 0;
					}

					.text {
						flex: 1;
						height: 44rpx;
						line-height: 44rpx;

						text {
							padding-left: 6rpx;
							font-size: 24rpx;
							color: #999;
						}
					}

					.check {
						padding: 2rpx 0;
					}
				}
			}
		}
	}
</style>
