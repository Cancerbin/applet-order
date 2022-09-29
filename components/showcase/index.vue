<template>
	<view class="module">
		<view class="option" v-for="(item, index) in listData" :key="item.id" @click="onViewDetail(item)">
			<view class="picture">
				<u--image :src="$utils.formatPicture(item.picUrl)" width="328rpx" height="328rpx" mode="aspectFit">
				</u--image>
				<view class="cover" v-if="parseFloat(item.inventoryQuantity) <= 0">补货中</view>
			</view>
			<view class="title">{{item.itemName}}</view>
			<view class="size">规格：{{item.itemSize || '无'}}</view>
			<view class="operate">
				<view class="price">
					￥{{$utils.formatValue(item.transPrice)}}/{{item.unitName}}
				</view>
				<view class="cart" @click.stop="onPlus(item, index)">
					<u--image src="/static/home/cart.png" width="48rpx" height="48rpx" mode="aspectFit">
					</u--image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: ['detail'],
		data() {
			return {
				listData: []
			}
		},
		created() {
			this.fetchList();
		},
		methods: {
			fetchList() {
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/homeTemplateModel/queryHomeModelItemList',
					data: {
						detailId: this.detail.detailList[0].id,
						modelNo: this.detail.modelNo,
						branchNo: uni.getStorageSync('transBranchNo')
					}
				}).then(res => {
					if (res?.code === 0) {
						this.listData = this.$utils.onSyncNumber(res.data);
					}
				})
			},
			// 查看商品详情
			onViewDetail(record) {
				uni.navigateTo({
					url: `/packageCategory/pages/detail/index?detail=${encodeURIComponent(JSON.stringify(record))}`
				})
			},
			// 加购物车
			onPlus(record, index) {
				const cacheList = uni.getStorageSync('cacheList') || [];
				const cIndex = cacheList.findIndex(item => item.itemNo === record.itemNo);
				if (record.memo === '强配单') {
					uni.showModal({
						title: '提示',
						content: '强配商品不能进行操作',
						showCancel: false
					})
					return;
				}
				this.$utils.onPlusNumber({
						...record,
						itemQty: cIndex >= 0 ? cacheList[cIndex].itemQty : 0
					})
					.then(number => {
						this.listData[index].itemQty = number;
						this.$utils.updateCache({
							...record,
							itemQty: cIndex >= 0 ? cacheList[cIndex].itemQty : 0
						}, number);
						uni.showToast({
							icon: "success",
							title: '加购成功'
						})
					})
			}
		}
	}
</script>

<style lang="scss">
	.module {
		padding: 0 10rpx;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-between;

		.option {
			width: 328rpx;
			margin-top: 10rpx;
			padding: 16rpx;
			border-radius: 8rpx;
			background-color: #fff;

			.picture {
				position: relative;

				.cover {
					position: absolute;
					top: 50%;
					left: 50%;
					width: 100%;
					height: 100%;
					font-size: 32rpx;
					color: #fff;
					text-align: center;
					line-height: 313rpx;
					transform: translate(-50%, -50%);
					background-color: rgba(0, 0, 0, .3);
				}
			}

			.title {
				margin-top: 16rpx;
				height: 32rpx;
				font-size: 28rpx;
				color: #333;
				line-height: 32rpx;
				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}

			.size {
				margin-top: 10rpx;
				font-size: 24rpx;
				color: #999;
			}

			.operate {
				display: flex;
				margin-top: 10rpx;
				height: 48rpx;
				font-size: 32rpx;
				color: #f50;
				line-height: 48rpx;

				.price {
					flex: 1;
				}

				.cart {
					width: 56rpx;
				}
			}

			&:nth-child(1),
			&:nth-child(2) {
				margin-top: 0;
			}
		}
	}
</style>
