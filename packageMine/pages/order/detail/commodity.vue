<template>
	<view>
		<view class="container">
			<view class="wrapper" v-for="(item, index) in listData" :key="item.id">
				<view class="avatar">
					<u-image :src="$utils.formatPicture(item.picUrl)" width="140rpx" height="140rpx" radius="12rpx">
					</u-image>
				</view>
				<view class="details">
					<view class="title">
						<text class="activity" v-if="item.promotionType">{{$utils.formatPromotionType(item)}}</text>
						<text>{{item.itemName}}</text>
					</view>
					<view class="layout">
						<view>货号：{{item.itemNo}}</view>
						<view>单价：<text class="mark">￥{{formatAmount(item.price)}}</text></view>
					</view>
					<view class="layout">
						<view>要货数量：{{formatQuantity(item.count)}}</view>
						<view>小计：<text class="mark">￥{{formatAmount(item.totalAmt)}}</text></view>
					</view>
					<view class="layout" v-if="parseFloat(item.deliveryAmt) > 0">
						<view>配送数量：{{formatQuantity(item.deliveryCount)}}</view>
						<view>配送金额：<text class="mark">￥{{formatAmount(item.deliveryAmt)}}</text></view>
					</view>
					<view class="layout">
						<view>规格：{{item.itemSize || '无'}}</view>
						<view v-if="parseFloat(item.deliveryAmt) > 0">
							<text>差异金额：</text>
							<text class="mark">￥{{formatDifferenceAmount(item)}}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<u-loadmore v-if="listData.length" :status="loadStatus" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				sourceList: [],
				listData: [],
				page: 1,
				size: 20,
				pages: 1,
				loadStatus: 'loadmore'
			}
		},
		onLoad(options) {
			this.sourceList = JSON.parse(decodeURIComponent(options.list));
			this.pages = Math.ceil(this.sourceList.length / this.size);
			this.loadData();
		},
		onReachBottom() {
			if (this.page < this.pages) {
				this.page += 1;
				this.loadData();
			}
		},
		methods: {
			// 加载数据
			loadData() {
				const loadData = this.sourceList.slice((this.page - 1) * this.size, this.page * this.size);
				this.listData = this.listData.concat(loadData);
				this.loadStatus = this.page < this.pages ? 'loadmore' : 'nomore';
			},
			// 格式化金额
			formatAmount(value) {
				return this.$utils.formatValue(value);
			},
			// 格式化数量
			formatQuantity(value) {
				return this.$utils.formatValue(value, 'quantity');
			},
			// 格式化差异金额
			formatDifferenceAmount(record) {
				return this.formatAmount(record.totalAmt - record.deliveryAmt);
			}
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

		.container {
			padding: 0 20rpx;
			background-color: #fff;

			.wrapper {
				display: flex;
				flex-direction: row;
				padding: 20rpx 0;
				border-top: 1rpx solid #dadbde;

				.avatar {
					width: 160rpx;
					height: 140rpx;
				}

				.details {
					flex: 1;
					overflow: hidden;

					.title {
						font-size: 28rpx;
						font-weight: bold;
						color: #333;
						line-height: 44rpx;

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

					.layout {
						display: flex;
						flex-direction: row;
						margin-top: 10rpx;
						font-size: 22rpx;
						color: #666;
						line-height: 32rpx;

						view {
							flex: 1;

							.mark {
								color: #f50;
							}
						}
					}
				}

				&:first-child {
					border-top: 0;
				}
			}
		}
	}
</style>
