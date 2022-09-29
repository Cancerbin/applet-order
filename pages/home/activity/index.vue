<template>
	<view>
		<view class="container">
			<view class="option" v-for="(item, index) in listData" :key="item.id" v-if="index < limitNumber"
				@click.stop="onViewDetail(item)">
				<view class="picture">
					<u--image :src="$utils.formatPicture(item.picUrl)" width="313rpx" height="313rpx" mode="aspectFit">
					</u--image>
					<view class="cover" v-if="parseFloat(item.inventoryQuantity) <= 0">补货中</view>
				</view>
				<view class="title">{{item.itemName}}</view>
				<view class="size">规格：{{item.itemSize || '无'}}</view>
				<view class="price">
					<text>￥{{formatDeliveryPrice(item)}}/{{item.unitName}}</text>
					<text class="special" v-if="formatSpecialFlag(item)">
						{{$utils.formatValue(item.transPrice)}}
					</text>
				</view>
				<view class="operate">
					<view class="activity" v-if="item.giftAndReduceVO || item.promotionItemVO">
						{{$utils.formatPromotionActivity(item)}}
					</view>
					<view class="placeholder"></view>
					<view class="tips" v-if="!item.itemQty">
						起订数量{{parseFloat(item.minOrderAmt || 1)}}
					</view>
					<view class="reduce" v-if="item.itemQty" @click.stop="onReduce(item, index)">
						<u-image src="/static/commodity/icon_reduce.png" width="48rpx" height="48rpx">
						</u-image>
					</view>
					<view class="number" v-if="item.itemQty">{{item.itemQty}}</view>
					<view class="plus" @click.stop="onPlus(item, index)">
						<u-image src="/static/commodity/icon_plus.png" width="48rpx" height="48rpx">
						</u-image>
					</view>
				</view>
			</view>
		</view>
		<u-loadmore v-if="listData.length" :status="loadStatus" />
		<view v-else class="empty">
			<u-empty mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"></u-empty>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				detail: [],
				page: 1,
				size: 20,
				pages: 1,
				listData: [],
				limitNumber: 0,
				loadStatus: 'loadmore'
			}
		},
		onLoad(option) {
			const detail = JSON.parse(decodeURIComponent(option.record));
			uni.setNavigationBarTitle({
				title: detail.activateName
			});
			this.detail = detail;
			this.fetchList();
		},
		onShow() {
			if (this.listData.length) {
				this.listData = this.$utils.onSyncNumber(this.listData);
			}
		},
		onPullDownRefresh() {
			this.page = 1;
			this.limitNumber = 0;
			this.fetchList();
		},
		onReachBottom() {
			if (this.page < this.pages) {
				this.page += 1;
				this.onLoadData();
			}
		},
		methods: {
			// 获取活动列表
			fetchList() {
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/homeTemplateModel/queryHomeModelItemList',
					data: {
						detailId: this.detail.id,
						modelNo: this.detail.modelNo,
						branchNo: uni.getStorageSync('transBranchNo')
					}
				}).then(res => {
					if (res?.code === 0) {
						this.listData = this.$utils.onSyncNumber(res.data);
						this.pages = Math.ceil(this.listData.length / this.size);
						this.onLoadData();
						uni.hideLoading();
						uni.stopPullDownRefresh();
					}
				})
			},
			onLoadData() {
				this.limitNumber = this.page * this.size;
				this.loadStatus = this.page < this.pages ? 'loadmore' : 'nomore';
			},
			// 查看商品
			onViewDetail(record) {
				uni.navigateTo({
					url: `/packageCategory/pages/detail/index?detail=${encodeURIComponent(JSON.stringify(record))}`
				})
			},
			// 减少数量
			onReduce(record, index) {
				if (record.memo === '强配单') {
					uni.showModal({
						title: '提示',
						content: '强配商品不能进行操作',
						showCancel: false
					})
					return;
				}
				this.$utils.onReduceNumber(record)
					.then(number => {
						this.listData[index].itemQty = number;
						this.$utils.updateCache(record, number);
					})
			},
			// 添加数量
			onPlus(record, index) {
				if (record.memo === '强配单') {
					uni.showModal({
						title: '提示',
						content: '强配商品不能进行操作',
						showCancel: false
					})
					return;
				}
				this.$utils.onPlusNumber(record)
					.then(number => {
						this.listData[index].itemQty = number;
						this.$utils.updateCache(record, number);
					})
			},
			// 格式化配送价
			formatDeliveryPrice(record) {
				let price = record.transPrice;
				if (this.formatSpecialFlag(record)) {
					price = record.promotionItemVO.specTransPrice;
				}
				return this.$utils.formatValue(price);
			},
			// 格式化特价状态
			formatSpecialFlag(record) {
				let flag = false;
				if (record.promotionItemVO?.promotionType === '10' || record.promotionItemVO?.promotionType === '20') {
					flag = true;
				}
				return flag;
			}
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: calc(env(safe-area-inset-bottom) / 1.5);

		.container {
			padding: 0 20rpx;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: space-between;

			.option {
				width: 313rpx;
				margin-top: 20rpx;
				padding: 16rpx;
				border-radius: 6rpx;
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
					margin-top: 6rpx;
					line-height: 48rpx;

					.activity {
						padding: 0 12rpx;
						font-size: 20rpx;
						font-weight: normal;
						color: #fff;
						border-radius: 6rpx;
						background-color: #f56c6c;
					}

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

			.empty {
				padding-top: 150rpx;
			}
		}
	}
</style>
