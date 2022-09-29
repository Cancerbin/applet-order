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
					<text class="tag">配送中心</text>
					<text>{{detail.itemName}}</text>
				</view>
				<view class="base">货号：{{detail.itemNo}}</view>
				<view class="base">商品条码：{{detail.itemSubno}}</view>
				<view class="price">
					<text>￥{{formatDeliveryPrice()}}/{{detail.unitName}}</text>
					<text class="special" v-if="formatSpecialFlag()">
						{{$utils.formatValue(detail.transPrice)}}
					</text>
				</view>
			</view>
		</view>
		<!-- 促销信息 -->
		<view class="card" v-if="detail.promotionItemVO || detail.giftAndReduceVO">
			<view class="title">促销信息</view>
			<u-line></u-line>
			<view class="content">
				<view class="activity">
					<view class="tag">{{$utils.formatPromotionActivity(detail)}}</view>
					{{formatActivityText()}}
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
						<view>起订：{{parseFloat(detail.minOrderAmt)|| 1}}</view>
					</u-col>
				</u-row>
				<u-row customStyle="margin-top: 16rpx">
					<u-col span="6">
						<view>订货组数：{{parseFloat(detail.orderChangeAmt)|| 1}}</view>
					</u-col>
					<u-col span="6">
						<view>限购：{{parseFloat(detail.maxOrderAmt) || '不限购'}}</view>
					</u-col>
				</u-row>
				<u-row customStyle="margin-top: 16rpx">
					<u-col span="6">
						<view>品牌类型：{{detail.itemBrand || '未知'}}</view>
					</u-col>
					<u-col span="6">
						<view>分类：{{detail.itemClsName || '无'}}</view>
					</u-col>
				</u-row>
				<u-row customStyle="margin-top: 16rpx">
					<u-col span="6">
						<view>
							保质期：
							<text v-if="detail.shelfLife">{{parseInt(detail.shelfLife)}}天</text>
							<text v-else>包装可见</text>
						</view>
					</u-col>
					<u-col span="6">
						<view>库存：{{parseFloat(detail.inventoryQuantity) > 0 ?'有':'无'}}库存</view>
					</u-col>
				</u-row>
				<view class="text">生产日期：{{formatProductionDate()}}</view>
				<view class="text">附加信息：{{detail.memo || '无'}}</view>
			</view>
		</view>
		<view class="footer">
			<view class="link" @click="onJump('home')">
				<u-icon name="home" label="首页" labelPos="bottom" color="#666" size="44rpx" labelSize="22rpx"></u-icon>
			</view>
			<view class="link" @click="onJump('cart')">
				<u-icon name="shopping-cart" label="购物车" labelPos="bottom" color="#666" size="44rpx" labelSize="22rpx">
				</u-icon>
			</view>
			<view class="action">
				<view class="placeholder"></view>
				<view class="reduce" v-if="detail.itemQty" @click="onReduce">
					<u-image src="/static/commodity/icon_reduce.png" width="48rpx" height="48rpx">
					</u-image>
				</view>
				<view class="number" v-if="detail.itemQty">
					<u--input type="number" inputAlign="center" v-model="number" @blur="onUpdateNumber"></u--input>
				</view>
				<view class="plus" @click="onPlus">
					<u-image src="/static/commodity/icon_plus.png" width="48rpx" height="48rpx">
					</u-image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				detail: {},
				number: 0
			}
		},
		onLoad(options) {
			const detail = JSON.parse(decodeURIComponent(options.detail));
			const cacheList = uni.getStorageSync('cacheList') || [];
			const cIndex = cacheList.findIndex(item => item.itemNo === detail.itemNo);
			detail.itemQty = cIndex >= 0 ? cacheList[cIndex].itemQty : 0;
			this.detail = detail;
			this.number = detail.itemQty;
		},
		methods: {
			// 跳转路由
			onJump(type) {
				let url;
				switch (type) {
					case 'home':
						url = '/pages/home/index';
						break;

					case 'cart':
						url = '/pages/cart/index';
						break;

					default:
						break;
				}
				uni.switchTab({
					url
				})
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
						this.number = number;
						this.detail.itemQty = number;
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
						this.number = number;
						this.detail.itemQty = number;
						this.$utils.updateCache(this.detail, number);
					})
			},
			// 更新数量
			onUpdateNumber() {
				const value = parseFloat(this.number || 0);
				if (value === this.detail.itemQty) {
					return;
				}
				this.$utils.onUpdateNumber(this.detail, value)
					.then(number => {
						this.number = number;
						this.detail.itemQty = number;
						this.$utils.updateCache(this.detail, number);
					})
					.catch(() => {
						this.number = this.detail.itemQty;
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
			},
			// 格式化活动描述
			formatActivityText() {
				if (this.detail.promotionItemVO) {
					const dictionary = {
						'10': '秒杀',
						'20': '特价',
						'30': '团购'
					}
					return `参与${dictionary[this.detail.promotionItemVO.promotionType]}活动，特价￥${this.formatDeliveryPrice()}`;
				} else {
					return this.detail.giftAndReduceVO?.promotionTips?.replace(new RegExp("\n", "gm"), " ");
				}
			},
			// 格式化生产日期
			formatProductionDate() {
				let text = '见包装';
				if (this.detail.productionStart) {
					text = this.detail.productionEnd ? `${this.detail.productionStart} ~ ${this.detail.productionEnd}` :
						this.detail.productionStart;
				}
				return text;
			}
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

				.activity {
					position: relative;
					height: 48rpx;
					padding-left: 120rpx;
					font-size: 24rpx;
					color: #999;
					line-height: 48rpx;

					.tag {
						position: absolute;
						top: 0;
						left: 0;
						height: 48rpx;
						width: 90rpx;
						padding: 0 8rpx;
						font-size: 20rpx;
						color: #fff;
						line-height: 48rpx;
						text-align: center;
						text-indent: 0;
						border-radius: 6rpx;
						background-color: #f56c6c;
					}
				}

				.text {
					margin-top: 16rpx;
				}
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

			.link {
				width: 150rpx;
				padding: 16rpx 0;
				text-align: center;
			}

			.action {
				display: flex;
				flex-direction: row;
				flex: 1;
				height: 104rpx;
				overflow: hidden;

				.placeholder {
					flex: 1;
				}

				.plus,
				.reduce {
					width: 48rpx;
					height: 48rpx;
					padding: 28rpx;
				}

				.number {
					width: 150rpx;
					margin: 16rpx 0;
					border-bottom: 1rpx solid #377cfd;
				}
			}
		}
	}
</style>
