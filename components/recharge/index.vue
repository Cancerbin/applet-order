<template>
	<u-modal :show="true" :showCancelButton="true" title="订单支付" @confirm="onRecharge" @cancel="onCancel">
		<view class="module">
			<view class="column">
				<view class="label">应付金额：</view>
				<view class="text">￥{{$utils.formatValue(payAmt)}}</view>
			</view>
			<u-line></u-line>
			<view class="column">
				<view class="label">当前余额：</view>
				<view class="text">￥{{$utils.formatValue(balance)}}</view>
			</view>
			<u-line></u-line>
			<view class="column">
				<view class="label">充值金额：</view>
				<view class="text">￥{{$utils.formatValue(payAmt - balance)}}</view>
			</view>
		</view>
	</u-modal>
</template>

<script>
	export default {
		props: ['payAmt', 'sheetNo'],
		data() {
			return {
				balance: 0
			}
		},
		created() {
			this.fetchBalance();
		},
		methods: {
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
			// 充值
			onRecharge() {
				uni.showLoading({
					title: "支付中",
					mask: true
				})
				this.$utils.onWxPayment({
						amount: parseFloat(this.$utils.formatValue((this.payAmt - this.balance) * 100))
					})
					.then(() => {
						this.fetchPaymentResult();
					})
					.catch(() => {
						this.$emit('onReult', 'fail');
					});
			},
			// 获取支付结果
			fetchPaymentResult() {
				this.$utils.onInquirePaymentResult(this.sheetNo)
					.then(() => {
						if (this.sheetNo === 'custom') {
							this.$emit('onReult', 'success');
						} else {
							this.onPay();
						}
					})
					.catch((error) => {
						this.$emit('onReult', 'fail');
					})
			},
			// 支付订单
			onPay() {
				this.$utils.onStoredValuePayment(this.sheetNo)
					.then(() => {
						this.$emit('onReult', 'success');
					})
					.catch(() => {
						this.$emit('onReult', 'fail');
					})
			},
			// 关闭弹窗
			onCancel() {
				this.$emit('onReult', 'cancel');
			}
		}
	}
</script>

<style lang="scss">
	.module {
		width: 100%;

		.column {
			display: flex;
			padding: 20rpx 0;
			font-size: 28rpx;

			view {
				flex: 1;
				line-height: 36rpx;

				&.label {
					color: #333;
				}

				&.text {
					font-weight: bold;
					color: #f50;
					text-align: right;
				}
			}
		}
	}
</style>
