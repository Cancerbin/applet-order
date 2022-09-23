<template>
	<view class="module" @click.stop="onClick">
		<view class="picture">
			<u-image :src="$utils.formatPicture(detail.picUrl)" :lazyLoad="false" :fade="false" width="180rpx"
				height="180rpx">
			</u-image>
			<view class="cover" v-if="parseFloat(detail.inventoryQuantity) <= 0">补货中</view>
		</view>
		<view class="material">
			<view class="title">
				<text class="activity" v-if="detail.giftAndReduceVO || detail.promotionItemVO">
					{{$utils.formatPromotionActivity(detail)}}
				</text>
				<text>{{detail.itemName}}</text>
			</view>
			<view class="date">生产日期：{{detail.productionStart || '见包装'}}</view>
			<view class="price">
				<text>￥{{formatDeliveryPrice()}}/{{detail.unitName}}</text>
				<text class="special" v-if="formatSpecialFlag()">
					{{$utils.formatValue(detail.transPrice)}}
				</text>
			</view>
			<view class="operate">
				<view class="placeholder"></view>
				<view class="tips" v-if="!formatNumberShow">
					起订数量{{parseFloat(detail.minOrderAmt || 1)}}
				</view>
				<view class="reduce" v-if="formatNumberShow" @click.stop="onReduce">
					<u-image src="/static/commodity/icon_reduce.png" width="48rpx" height="48rpx">
					</u-image>
				</view>
				<view class="number" v-if="formatNumberShow">
					{{detail.itemQty}}
				</view>
				<view class="plus" @click.stop="onPlus">
					<u-image src="/static/commodity/icon_plus.png" width="48rpx" height="48rpx">
					</u-image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: ['detail', 'index'],
		methods: {
			// 点击事件
			onClick() {
				this.$emit('onClick', this.index);
			},
			// 减少数量
			onReduce() {
				if (this.detail.memo === '强配单') {
					uni.showModal({
						title: '提示',
						content: '强配商品不能进行操作',
						showCancel: false
					})
					return;
				}
				this.$utils.onReduceNumber(this.detail)
					.then(number => {
						this.$emit("onModify", this.index, number);
						this.$utils.updateCache(this.detail, number);
					})
			},
			// 添加数量
			onPlus() {
				if (this.detail.memo === '强配单') {
					uni.showModal({
						title: '提示',
						content: '强配商品不能进行操作',
						showCancel: false
					})
					return;
				}
				this.$utils.onPlusNumber(this.detail)
					.then(number => {
						this.$emit("onModify", this.index, number);
						this.$utils.updateCache(this.detail, number);
					})
			},
			// 格式化配送价
			formatDeliveryPrice() {
				let price = this.detail.transPrice;
				if (this.formatSpecialFlag()) {
					price = this.detail.promotionItemVO.specTransPrice;
				}
				return this.$utils.formatValue(price);
			},
			// 格式化特价状态
			formatSpecialFlag() {
				let flag = false;
				if (this.detail.promotionItemVO?.promotionType === '10' || this.detail.promotionItemVO?.promotionType ===
					'20') {
					flag = true;
				}
				return flag;
			}
		},
		computed: {
			// 格式化数量展示
			formatNumberShow() {
				let flag = false;
				if (this.detail.itemQty) {
					flag = true;
				}
				return flag;
			}
		}
	}
</script>

<style lang="scss">
	.module {
		display: flex;
		flex-direction: row;
		padding: 20rpx;

		.picture {
			position: relative;
			width: 180rpx;
			min-height: 180rpx;

			.cover {
				position: absolute;
				top: 0;
				left: 0;
				width: 180rpx;
				height: 180rpx;
				font-size: 32rpx;
				color: #fff;
				text-align: center;
				line-height: 180rpx;
				background-color: rgba(0, 0, 0, .3);
			}
		}

		.material {
			flex: 1;
			padding-left: 20rpx;
			overflow: hidden;

			.title {
				font-size: 28rpx;
				color: #333;
				line-height: 44rpx;
				word-break: break-all;

				.activity {
					display: inline-block;
					margin-right: 10rpx;
					padding: 0 12rpx;
					font-size: 20rpx;
					font-weight: normal;
					color: #fff;
					border-radius: 6rpx;
					background-color: #f56c6c;
				}
			}

			.date {
				margin-top: 8rpx;
				font-size: 24rpx;
				color: #999;
			}

			.price {
				margin-top: 10rpx;
				font-size: 30rpx;
				color: #f50;
				line-height: 36rpx;

				.special {
					padding-left: 8rpx;
					font-size: 22rpx;
					color: #999;
					text-decoration: line-through;
				}
			}

			.operate {
				display: flex;
				flex-direction: row;
				margin-top: 8rpx;
				line-height: 48rpx;

				.placeholder {
					flex: 1;
				}

				.tips {
					padding-right: 16rpx;
					font-size: 24rpx;
					color: #377cfd;
				}

				.number {
					width: 80rpx;
					font-size: 28rpx;
					text-align: center;
				}
			}
		}
	}
</style>
