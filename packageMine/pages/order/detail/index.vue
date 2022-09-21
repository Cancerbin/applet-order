<template>
	<view>
		<u-sticky offset-top="0">
			<u-subsection :list="tabList" :current="tabIndex" fontSize="16" :bold="false" @change="onChangeTab"
				bgColor="#e8e8e8">
			</u-subsection>
		</u-sticky>
		<view class="container">
			<view>
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
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				sheetNo: '',
				tabList: ['订单详情', '订单状态'],
				tabIndex: 0,
				detail: {}
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
			// 格式化金额
			formatAmount(value) {
				return this.$utils.formatValue(value);
			},
			// 格式化数量
			formatQuantity(value) {
				return this.$utils.formatValue(value, 'quantity');
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
			}
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
			}
		}
	}
</style>
