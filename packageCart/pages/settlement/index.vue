<template>
	<view>
		<!-- 付款方式 -->
		<view class="section">
			<view class="title">付款方式</view>
			<view v-for="item in paymentList" :key="item.type">
				<u-line></u-line>
				<view class="payment" @click="onChangePayment(item.type)">
					<view class="picture">
						<u-image width="36rpx" height="36rpx" :src="item.url"></u-image>
					</view>
					<view class="label">
						<text>{{item.text}}</text>
						<text class="mark" v-if="item.type === 'cz'">(余额：￥{{$utils.formatValue(balance)}})</text>
					</view>
					<view class="check">
						<u--image :src="formatCheck(item.type)" :lazyLoad="false" :fade="false" width="40rpx"
							height="40rpx"></u--image>
					</view>
				</view>
			</view>
		</view>
		<!-- 费用明细 -->
		<view class="section">
			<view class="title">费用明细</view>
			<view>
				<u-line></u-line>
				<view class="cost">
					<view class="option">
						<u-row>
							<u-col span="7">
								<view class="info">付款商品</view>
							</u-col>
							<u-col span="2">
								<view class="info">
									x{{parseFloat(detail.itemQty || 0) - parseFloat(detail.allGiftCount || 0)}}
								</view>
							</u-col>
							<u-col span="3">
								<view class="price">￥{{parseFloat(detail.sheetAmt)}}</view>
							</u-col>
						</u-row>
					</view>
					<view class="option">
						<u-row>
							<u-col span="7">
								<view class="info">赠送商品</view>
							</u-col>
							<u-col span="2">
								<view class="info">
									x{{parseFloat(detail.allGiftCount || 0)}}
								</view>
							</u-col>
							<u-col span="3">
								<view class="price">￥0</view>
							</u-col>
						</u-row>
					</view>
					<view class="option">
						<u-row>
							<u-col span="7">
								<view class="info">满减金额</view>
							</u-col>
							<u-col span="2"></u-col>
							<u-col span="3">
								<view class="price">￥{{parseFloat(detail.allReduceAmt)}}</view>
							</u-col>
						</u-row>
					</view>
					<view class="option">
						<u-row>
							<u-col span="7">
								<view class="info">优惠金额</view>
							</u-col>
							<u-col span="2"></u-col>
							<u-col span="3">
								<view class="price">￥{{parseFloat(detail.promotionAmt)}}</view>
							</u-col>
						</u-row>
					</view>
					<view class="option">
						<u-row>
							<u-col span="7">
								<view class="info">券抵扣金额</view>
							</u-col>
							<u-col span="2"></u-col>
							<u-col span="3">
								<view class="price">￥{{parseFloat(detail.couponAmt)}}</view>
							</u-col>
						</u-row>
					</view>
					<view class="option">
						<u-row>
							<u-col span="7">
								<view class="info">服务费</view>
							</u-col>
							<u-col span="2"></u-col>
							<u-col span="3">
								<view class="price">￥{{parseFloat(detail.serviceFeeAmt)}}</view>
							</u-col>
						</u-row>
					</view>
					<view class="option">
						<u-row>
							<u-col span="7">
								<view class="info">配送费</view>
							</u-col>
							<u-col span="2"></u-col>
							<u-col span="3">
								<view class="price">￥{{parseFloat(detail.deliveryFeeAmt)}}</view>
							</u-col>
						</u-row>
					</view>
					<u-line margin="20rpx 0 0"></u-line>
					<view class="coupon">
						<view class="label">优惠券</view>
						<view class="check" @click="onOpenCouponModal">
							<text v-if="detail.moneyCouponList && detail.moneyCouponList.length">
								{{couponItem.id ? `￥${parseFloat(couponItem.price)}`:'请选择'}}</text>
							</text>
							<text v-else>暂无优惠券可使用</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 商品明细 -->
		<view class="section">
			<view class="title">商品明细</view>
			<view>
				<u-line></u-line>
				<view class="commodity">
					<view v-for="(item, index) in detail.detailsVOList" :key="index" v-if="index < limitNumber">
						<u-line v-if="index > 0"></u-line>
						<view class="option">
							<view class="picture">
								<u--image :src="$utils.formatPicture(item.picUrl)" width="104rpx" height="104rpx">
								</u--image>
							</view>
							<view class="info">
								<view class="name">{{item.itemName}}</view>
								<view class="memo">规格：{{item.itemSize || '无'}}</view>
								<view class="activity">
									<view v-if="item.promotionType">{{$utils.formatPromotionType(item)}}</view>
								</view>
							</view>
							<view class="count">
								<view class="price">￥{{$utils.formatValue(item.price)}}</view>
								<view class="normal">x{{parseFloat(item.count)}}</view>
								<view class="normal">小计:￥{{$utils.formatValue(item.price * item.count)}}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 加载 -->
		<u-loadmore v-if="page < pages" status="loadmore" />

		<view class="footer">
			<view class="summary">
				<view class="total">合计：<text>￥{{formatTotalAmount()}}</text></view>
				<view class="discount">已优惠：￥{{formatDiscountAmount()}}</view>
			</view>
			<view class="btn" @click="onSubmit">提交订单</view>
		</view>

		<!-- 优惠券弹窗 -->
		<u-overlay :show="couponModalVisible">
			<view class="modal">
				<view class="header">
					<view class="title">
						<text>选择优惠券</text>
						<view class="cancel" @click="onCancel">不使用</view>
					</view>
					<view class="remark">点击优惠券就可使用</view>
				</view>
				<u-line></u-line>
				<view class="wrapper">
					<scroll-view class="scroll" :scroll-y="true">
						<view class="coupon" v-for="item in detail.moneyCouponList" :key="item.id"
							@click="onCheckCoupon(item)">
							<view class="amount">￥{{parseFloat(item.price)}}</view>
							<view class="condition">满{{parseFloat(item.conditionPrice)}}元可用</view>
							<view class="picture" v-if="couponItem.id === item.id">
								<u-image width="120rpx" height="120rpx" src="/static/cart/use.png"></u-image>
							</view>
						</view>
					</scroll-view>
				</view>
			</view>
		</u-overlay>

		<!-- 支付弹窗 -->
		<recharge v-if="rechargeModalVisible" :payAmt="formatTotalAmount()" :sheetNo="sheetNo"
			@onReult="onRechargeResult" />
	</view>
</template>

<script>
	import recharge from '@/components/recharge/index.vue';
	export default {
		data() {
			return {
				balance: 0,
				detail: {},
				settleList: [],
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
				couponItem: {},
				page: 1,
				pages: 1,
				size: 20,
				limitNumber: 0,
				couponModalVisible: false,
				sheetNo: '',
				rechargeModalVisible: false
			}
		},
		onLoad(options) {
			this.fetchBalance();
			this.detail = JSON.parse(decodeURIComponent(options.result));
			this.settleList = JSON.parse(decodeURIComponent(options.settleList));
			this.onLoadData();
		},
		onReachBottom() {
			if (this.page < this.pages) {
				this.page += 1;
				this.onLoadData();
			}
		},
		methods: {
			// 加载数据
			onLoadData() {
				this.pages = Math.ceil(this.detail.detailsVOList.length / this.size);
				this.limitNumber = this.page * this.size;
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
						this.onJump('success', '支付成功');
					})
					.catch((error) => {
						this.onJump('error', error);
					})
			},
			// 选择支付方式
			onChangePayment(type) {
				this.paymentType = type;
			},
			// 打开优惠券弹窗
			onOpenCouponModal() {
				this.couponModalVisible = true;
			},
			// 取消使用优惠券
			onCancel() {
				this.couponItem = {};
				this.couponModalVisible = false;
			},
			// 选择优惠券
			onCheckCoupon(record) {
				this.couponItem = record;
				this.couponModalVisible = false;
			},
			// 提交订单
			onSubmit() {
				uni.showModal({
					title: '提示',
					content: '是否确定提交订单？',
					success: (result) => {
						if (result.confirm) {
							uni.showLoading({
								title: "提交中",
								mask: true
							})
							const params = {
								branchNo: uni.getStorageSync('branchNo'),
								transBranchNo: uni.getStorageSync('transBranchNo'),
								detailsSaveDTOList: this.settleList,
								orderSrc: 2,
								transType: 0
							}
							if (this.couponItem.id) {
								params.moneyCouponNoList = [this.couponItem.couponNo];
							}
							this.$request({
								type: 'POST',
								url: '/api/order/wechat/pmEnquiryMaster/createBranchEnquiryMaster',
								data: params
							}).then(res => {
								if (res?.code === 0) {
									uni.showLoading({
										title: "支付中",
										mask: true
									})
									// TODO 清除提交商品缓存
									this.settleList.forEach(item => {
										this.$utils.updateCache(item, 0)
									})
									this.sheetNo = res.data.sheetNo;
									if (this.paymentType === 'cz') {
										this.onStoredValuePayment(res.data);
									} else {
										this.onWxPayment(res.data);
									}
								}
							})
						}
					}
				})
			},
			// 储值支付
			onStoredValuePayment(record) {
				this.$utils.onStoredValuePayment(record.sheetNo)
					.then(() => {
						this.onJump('success', '支付成功');
					})
					.catch(error => {
						if (error.code === -100) {
							uni.showModal({
								title: '提示',
								content: '当前余额不足，是否充值支付？',
								success: (result) => {
									if (result.confirm) {
										this.rechargeModalVisible = true;
									} else {
										this.onJump('error', '支付失败');
									}
								}
							})
						} else {
							this.onJump('error', res.msg);
						}
					})
			},
			// 微信支付
			onWxPayment(record) {
				this.$utils.onWxPayment({
						sheetNo: record.sheetNo
					})
					.then(() => {
						this.fetchPaymentResult();
					})
					.catch(() => {
						this.onJump('error', '支付失败');
					});
			},
			// 获取充值结果
			onRechargeResult(type) {
				this.rechargeModalVisible = false;
				switch (type) {
					case 'cancel':
						this.onJump('error', '取消充值');
						break;

					case 'fail':
						this.onJump('error', '充值失败');
						break;

					case 'success':
						this.onJump('success', '支付成功');
						break;

					default:
						break;
				}
			},
			// 跳转路由
			onJump(type, message) {
				uni.showToast({
					icon: type,
					title: message,
					mask: true,
					duration: 2000
				});
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/mine/index'
					})
				}, 2000)
			},
			// 格式化付款方式选中状态
			formatCheck(type) {
				return `/static/cart/icon_${type === this.paymentType ? '' : 'un'}checked.png`;
			},
			// 格式化总金额
			formatTotalAmount() {
				let amount = this.$utils.formatValue(this.detail.payAmt);
				if (this.couponItem.id) {
					amount = this.$utils.formatValue(this.detail.payAmt - this.couponItem.price);
				}
				return amount;
			},
			// 格式化优惠金额
			formatDiscountAmount() {
				let amount = this.$utils.formatValue(this.detail.sheetAmt - this.detail.chargeAmt);
				if (this.couponItem.id) {
					amount = this.$utils.formatValue(parseFloat(amount) + parseFloat(this.couponItem.price));
				}
				return amount;
			}
		},
		components: {
			recharge
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom) / 1.5);

		.section {
			margin-top: 20rpx;
			background-color: #fff;

			.title {
				padding: 20rpx;
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				line-height: 44rpx;
			}

			.payment {
				display: flex;
				flex-direction: row;
				padding: 20rpx;

				.picture {
					width: 48rpx;
					padding: 4rpx 0;
				}

				.label {
					flex: 1;
					height: 44rpx;
					line-height: 44rpx;

					.mark {
						padding-left: 6rpx;
						font-size: 24rpx;
						color: #999;
					}
				}

				.check {
					padding: 2rpx 0;
				}
			}

			.cost {

				.option {
					padding: 20rpx 20rpx 0;

					.info,
					.price {
						height: 36rpx;
						color: #999;
						line-height: 36rpx;
					}

					.price {
						text-align: right;
					}
				}

				.coupon {
					display: flex;
					flex-direction: row;
					padding: 20rpx;
					font-size: 28rpx;
					line-height: 44rpx;

					.label {
						width: 200rpx;
						color: #999;
					}

					.check {
						flex: 1;
						text-align: right;
						color: #666;
					}
				}
			}

			.commodity {
				padding: 0 20rpx;

				.option {
					display: flex;
					flex-direction: row;
					padding: 20rpx 0;

					.picture {
						width: 120rpx;
					}

					.info {
						flex: 1;

						.name {
							font-size: 28rpx;
							font-weight: bold;
							color: #666;
							line-height: 36rpx;
						}

						.memo {
							font-size: 24rpx;
							color: #999;
							line-height: 32rpx;
						}

						.activity {
							margin-top: 6rpx;
							overflow: hidden;

							view {
								float: left;
								height: 48rpx;
								padding: 0 12rpx;
								font-size: 24rpx;
								color: #fff;
								line-height: 48rpx;
								border-radius: 6rpx;
								background-color: #f56c6c;
							}
						}
					}

					.count {
						width: 250rpx;
						text-align: right;

						.price {
							height: 40rpx;
							font-size: 28rpx;
							color: #333;
							line-height: 40rpx;
						}

						.normal {
							height: 32rpx;
							font-size: 24rpx;
							color: #999;
							line-height: 32rpx;
						}
					}
				}
			}

			&:first-child {
				margin-top: 0;
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

			.summary {
				flex: 1;
				padding-top: 14rpx;
				padding-right: 16rpx;
				text-align: right;

				.total {
					height: 44rpx;
					font-size: 32rpx;
					color: #333;
					line-height: 44rpx;

					text {
						color: #f56c6c;
					}
				}

				.discount {
					height: 36rpx;
					margin-top: 6rpx;
					font-size: 24rpx;
					color: #999;
					line-height: 36rpx;
				}
			}

			.btn {
				width: 200rpx;
				color: #fff;
				line-height: 100rpx;
				text-align: center;
				background-color: #f56c6c;
			}
		}

		.modal {
			width: 86%;
			height: 76%;
			margin: auto;
			padding: 0 16rpx;
			background-color: #fff;

			.header {
				padding: 16rpx 0;
				text-align: center;

				.title {
					position: relative;
					height: 44rpx;
					font-size: 32rpx;
					color: #333;
					line-height: 44rpx;

					.cancel {
						position: absolute;
						top: 0;
						right: 0;
						height: 44rpx;
						padding: 0 20rpx;
						font-size: 24rpx;
						color: #666;
						line-height: 44rpx;
						background-color: #fff;
					}
				}

				.remark {
					height: 32rpx;
					font-size: 24rpx;
					color: #999;
					line-height: 32rpx;
				}
			}

			.wrapper {
				flex: 1;
				padding: 16rpx 0;
				overflow: hidden;

				.scroll {
					height: 100%;

					.coupon {
						position: relative;
						margin-top: 16rpx;
						padding: 16rpx;
						color: #fff;
						text-align: center;
						background-color: #ff9661;
						overflow: hidden;

						.amount {
							font-size: 40rpx;
							font-weight: bold;
						}

						.condition {
							margin-top: 10rpx;
							font-size: 24rpx;
						}

						.picture {
							position: absolute;
							top: -40rpx;
							right: -20rpx;
						}

						&:first-child {
							margin-top: 0;
						}
					}
				}
			}
		}
	}
</style>
