<template>
	<view>
		<view v-if="listData.length">
			<view class="delivery">
				<view class="title">
					<view class="text">{{formatTransBranchName()}}</view>
					<view class="icon" @click="onDeleteAll">
						<u-icon name="trash" size="48rpx"></u-icon>
					</view>
				</view>
				<view class="limit">
					<view class="text">起送价：<text>￥{{formatDeliveryPrice()}}</text></view>
					<view class="icon" @click="onJump">
						<u--text suffixIcon="arrow-right" align="right" size="28rpx" color="#f56c6c" text="去凑凑"
							:iconStyle="iconStyle" lineHeight="36rpx"></u--text>
					</view>
				</view>
			</view>
			<u-line></u-line>
			<view class="list">
				<u-swipe-action>
					<view v-for="(item, index) in listData" v-if="index < limitNumber" :key="item.itemNo">
						<view class="activity" v-if="item.giftAndReduceVO">
							<view class="tag">
								<u-tag :text="$utils.formatPromotionActivity(item)" type="error" plain plainFill>
								</u-tag>
							</view>
							<view class="content">
								<view>{{formatPromotionText(item)}}</view>
								<view class="condition">{{formatPromotionStatus(item)}}</view>
							</view>
						</view>
						<u-swipe-action-item :index="item.itemNo" :options="options" :threshold="100"
							@click="onDelete(item, index)" :disabled="item.memo === '强配单'">
							<view class="option">
								<view class="checkbox" @click="onChangeChecked(item, index)">
									<u--image :src="formatChecked(item.checked)" width="40rpx" height="40rpx">
									</u--image>
								</view>
								<view class="commodity">
									<commodity :detail="item" :index="index" @onModify="this.onModifyNumber" />
								</view>
							</view>
						</u-swipe-action-item>
						<u-line></u-line>
					</view>
				</u-swipe-action>
			</view>
			<u-loadmore v-if="page < pages" status="loadmore" />

			<view class="footer">
				<view class="check" @click="onCheckedAll">
					<view class="picture">
						<u--image :src="formatAllChecked()" width="40rpx" height="40rpx"></u--image>
					</view>
					<view class="label">全选</view>
				</view>
				<view class="count">
					<view class="amount">总计：￥{{formatTotalAmount()}}</view>
					<view class="quantity">商品总类：{{formatTotalKind()}}&emsp;商品数量：{{formatTotalNumber()}}</view>
				</view>
				<view class="btn" @click="onSettle">去结算</view>
			</view>
		</view>

		<u-empty v-else mode="car" icon="http://cdn.uviewui.com/uview/empty/car.png" marginTop="300rpx">
		</u-empty>
	</view>
</template>

<script>
	import Commodity from '@/components/commodity/index.vue';
	export default {
		data() {
			return {
				limitNumber: 0,
				page: 1,
				size: 20,
				pages: 1,
				listData: [],
				iconStyle: {
					fontSize: '28rpx',
					color: '#f56c6c'
				},
				options: [{
					text: '删除',
					style: {
						backgroundColor: '#f56c6c',
						padding: '0 40rpx'
					}
				}]
			}
		},
		onShow() {
			this.listData = uni.getStorageSync('cacheList') || [];
			this.$utils.updateCart();
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
				this.pages = Math.ceil(this.listData.length / this.size);
				this.limitNumber = this.page * this.size;
			},
			// 删除选中商品
			onDeleteAll() {
				const tempList = this.listData.filter(item => item.checked);
				if (tempList.length) {
					uni.showModal({
						title: '提示',
						content: '是否确认删除选中的商品？',
						success: (res) => {
							if (res.confirm) {
								tempList.forEach(item => {
									const index = this.listData.findIndex(row => row.itemNo === item
										.itemNo);
									this.listData.splice(index, 1)
									this.$utils.updateCache(item, 0);
								})
							}
						}
					});
				} else {
					uni.showModal({
						title: '提示',
						content: '请勾选需要删除的商品',
						showCancel: false
					});
				}
			},
			// 跳转路由
			onJump() {
				uni.switchTab({
					url: '/pages/category/index'
				})
			},
			// 修改选中状态
			onChangeChecked(record, index) {
				this.listData[index].checked = !record.checked;
				uni.setStorageSync('cacheList', this.listData);
			},
			// 修改数量
			onModifyNumber(index, number) {
				if (number) {
					this.listData[index].itemQty = number;
				} else {
					this.listData.splice(index, 1);
				}
			},
			// 删除商品
			onDelete(record, index) {
				this.$utils.onUpdateNumber(record, 0)
					.then(number => {
						this.listData.splice(index, 1);
						this.$utils.updateCache(record, number);
					})
			},
			// 全选所有商品事件
			onCheckedAll() {
				const flag = this.listData.filter(item => item.checked).length === this.listData.length;
				const tempList = [].concat(this.listData);
				tempList.forEach(item => {
					item.checked = !flag;
				})
				this.listData = tempList;
				uni.setStorageSync('cacheList', tempList);
			},
			// 结算
			onSettle() {
				const amount = parseFloat(this.formatTotalAmount());
				const deliverPrice = parseFloat(this.formatDeliveryPrice());
				const settleList = this.listData.filter(item => item.checked).map(item => {
					const tempItem = {
						itemNo: item.itemNo,
						itemName: item.itemName,
						count: item.itemQty
					}
					if (item.promotionItemVO) {
						tempItem.promotionSheetNo = item.promotionItemVO.promotionSheetNo;
					}
					return tempItem
				});
				if (!settleList.length) {
					uni.showModal({
						title: '提示',
						content: '请选择需要结算的商品',
						showCancel: false
					});
					return;
				}
				if (amount < deliverPrice) {
					uni.showModal({
						title: '提示',
						content: '结算金额不能低于起送价',
						showCancel: false
					});
					return;
				}
				uni.showLoading({
					title: "结算中",
					mask: true
				})
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/pmEnquiryMaster/preCalculateOrder',
					data: {
						branchNo: uni.getStorageSync('branchNo'),
						transBranchNo: uni.getStorageSync('transBranchNo'),
						orderSrc: 2,
						transType: 0,
						detailsSaveDTOList: settleList
					}
				}).then(res => {
					if (res?.code === 0) {
						const {
							outOfStockList = []
						} = res.data;
						uni.hideLoading();
						// 判断是否存在库存不足商品
						if (outOfStockList.length) {
							this.onAdjustStock(outOfStockList);
						} else {
							uni.navigateTo({
								url: `/packageCart/pages/settlement/index?result=${encodeURIComponent(JSON.stringify(res.data))}&settleList=${encodeURIComponent(JSON.stringify(settleList))}`
							})
						}
					}
				})
			},
			// 调整数量
			onAdjustStock(array) {
				uni.showModal({
					title: '提示',
					content: '购物车存在库存不足的商品，将调整商品可购买数量或者删除商品，是否确认？',
					success: (res) => {
						if (res.confirm) {
							array.forEach((item) => {
								const quantity = parseFloat(item.inventoryQuantity);
								const fIndex = this.listData.findIndex(row => row.itemNo === item
									.itemNo);
								if (quantity > 0) {
									const number = this.$utils.onAdjustNumber(this.listData[fIndex],
										quantity);
									this.$utils.updateCache(this.listData[fIndex], number);
									if (number) {
										this.listData[fIndex].itemQty = number;
									} else {
										this.listData.splice(fIndex, 1);
									}
								} else {
									this.$utils.updateCache(this.listData[fIndex], 0);
									this.listData.splice(fIndex, 1);
								}
							})
						}
					}
				});
			},
			// 格式化配送中心名称
			formatTransBranchName() {
				return uni.getStorageSync('transBranchName');
			},
			// 格式化起送价
			formatDeliveryPrice() {
				return uni.getStorageSync('deliveryPrice');
			},
			// 格式化选中状态
			formatChecked(flag) {
				return `/static/cart/icon_${flag ? 'checked' : 'unchecked'}.png`
			},
			// 格式化全选状态
			formatAllChecked() {
				const flag = this.listData.filter(item => item.checked).length === this.listData.length;
				return `/static/cart/icon_${flag ? 'checked' : 'unchecked'}.png`;
			},
			// 格式化活动提示
			formatPromotionText(record) {
				let text;
				if (record.joinPromotion) {
					text = record.promotionItemVO.promotionTips || '';
				} else {
					text = record.giftAndReduceVO.promotionTips;
				}
				let textArray = text.split('\n');
				textArray = textArray.filter(item => item);
				return textArray.join('');
			},
			// 格式化活动状态
			formatPromotionStatus(record) {
				let status = false;
				let text;
				const tempJson = record.giftAndReduceVO;
				if (parseFloat(record.itemQty) >= parseFloat(tempJson.minOrderAmt)) {
					status = true;
				} else {
					text = '数量还差' + (parseFloat(tempJson.minOrderAmt) - parseFloat(record.itemQty)) +
						'个';
				}
				return (status ? '已满足' : '未满足') + (status ? '' : ('，' + text))
			},
			// 格式化总金额
			formatTotalAmount() {
				let amount = 0;
				this.listData.filter(item => item.checked).forEach(item => {
					if (item.promotionItemVO && item.promotionItemVO.specTransPrice) {
						amount += parseFloat(this.$utils.formatValue(item.itemQty * item.promotionItemVO
							.specTransPrice));
					} else {
						amount += parseFloat(this.$utils.formatValue(item.itemQty * item.transPrice));
					}
				})
				return this.$utils.formatValue(amount);
			},
			// 格式化总类别
			formatTotalKind() {
				return this.listData.filter(item => item.checked).length;
			},
			// 格式化总数量
			formatTotalNumber() {
				let quantity = 0;
				this.listData.filter(item => item.checked).forEach(item => {
					quantity += parseFloat(item.itemQty);
				})
				return quantity;
			}
		},
		components: {
			Commodity
		}
	}
</script>

<style lang="scss">
	page {
		padding-bottom: 104rpx;

		.delivery {
			padding: 16rpx;
			background-color: #fff;

			.title {
				display: flex;
				flex-direction: row;

				.text {
					flex: 1;
					font-weight: bold;
					line-height: 80rpx;
				}

				.icon {
					width: 48rpx;
					padding: 16rpx;
				}
			}

			.limit {
				display: flex;
				flex-direction: row;
				padding: 12rpx 0;

				.text {
					flex: 1;
					font-size: 28rpx;
					line-height: 36rpx;

					text {
						color: #f56c6c;
					}
				}

				.icon {
					width: 200rpx;
				}
			}
		}

		.list {

			.activity {
				display: flex;
				flex-direction: row;
				padding: 16rpx 20rpx 0;
				font-size: 24rpx;
				background-color: #fff;

				.tag {
					text-align: center;
				}

				.content {
					flex: 1;
					padding-left: 10rpx;
					line-height: 50rpx;
					overflow: hidden;

					.condition {
						color: #F15221;
					}
				}
			}

			.option {
				display: flex;
				flex-direction: row;

				.checkbox {
					display: flex;
					align-content: center;
					align-items: center;
					width: 40rpx;
					padding-left: 20rpx;
				}

				.commodity {
					flex: 1;
				}
			}
		}

		.footer {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			display: flex;
			flex-direction: row;
			padding: 16rpx 20rpx;
			box-shadow: 0 -1rpx 5rpx rgba(0, 0, 0, .1);
			background-color: #fff;
			z-index: 11;

			.check {
				display: flex;
				flex-direction: row;
				width: 110rpx;
				padding: 16rpx 0;

				.picture {
					width: 40rpx;
				}

				.label {
					flex: 1;
					height: 40rpx;
					font-size: 26rpx;
					line-height: 40rpx;
					text-align: center;
				}
			}

			.count {
				flex: 1;
				padding-left: 10rpx;
				font-size: 24rpx;
				line-height: 36rpx;

				.amount {
					color: #f50;
					font-weight: bold;
				}

				.quantity {
					color: #999;
				}
			}

			.btn {
				padding: 12rpx 30rpx;
				color: #fff;
				font-size: 28rpx;
				line-height: 48rpx;
				border-radius: 12rpx;
				background: linear-gradient(to bottom, #ffb661FF, #f6792eFF);
			}
		}
	}
</style>
