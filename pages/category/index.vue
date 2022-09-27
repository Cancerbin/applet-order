<template>
	<view class="container">
		<view>
			<!-- 安全距离 -->
			<u-status-bar bgColor="#377cfd"></u-status-bar>
			<view class="nav">
				<view class="title">分类</view>
				<view class="extra">
					<u-search placeholder="搜索您想要的商品" :disabled="true" :showAction="false" height="28px"
						@click="onJump"></u-search>
				</view>
			</view>
		</view>
		<view class="wrapper">
			<view class="menu">
				<scroll-view class="scroll" :scroll-y="true" :show-scrollbar="false">
					<view v-for="row in menu" :key="row.key">
						<view class="label" :class="{active: menuKey === row.itemClsno && !subMenuKey}"
							@click="onClickMenu(row)">
							{{row.itemClsname}}
						</view>
						<view class="children" v-if="row.children && menuKey === row.itemClsno">
							<view class="label" :class="{active: subMenuKey === col.itemClsno}"
								v-for="col in row.children" :key="col.key" @click="onClickSubMenu(col)">
								{{col.itemClsname}}
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
			<view class="main">
				<scroll-view class="scroll" :scroll-y="true" :scroll-top="scrollTop" :show-scrollbar="false"
					:refresher-threshold="50" :refresher-triggered="refreshStatus" :lower-threshold="100"
					:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefreshData"
					@scrolltolower="onLoadData" @scroll="onScroll">
					<view v-for="(item, index) in listData" :key="item.id">
						<commodity :detail="item" :index="index" @onModify="this.onModifyNumber"
							@onClick="this.onViewCommodity" />
						<u-line></u-line>
					</view>
					<u-loadmore v-if="listData.length" :status="loadStatus" />
					<view class="empty" v-else>
						<u-empty mode="list" icon="http://cdn.uviewui.com/uview/empty/list.png">
						</u-empty>
					</view>
				</scroll-view>
			</view>
		</view>
		<u-back-top :scroll-top="realScrollTop" @click="onBackTop"></u-back-top>
	</view>
</template>

<script>
	import Commodity from '@/components/commodity/index.vue';
	export default {
		data() {
			return {
				menu: [],
				menuKey: '',
				subMenuKey: '',
				page: 1,
				size: 20,
				pages: 1,
				listData: [],
				isLoading: false,
				refreshStatus: false,
				scrollTop: 0,
				realScrollTop: 0,
				loadStatus: 'loadmore'
			}
		},
		onLoad() {
			this.fetchMenu();
			this.fetchCommodityList();
		},
		onShow() {
			this.listData = this.$utils.onSyncNumber(this.listData);
			this.$utils.updateCart();
		},
		methods: {
			// 获取菜单
			fetchMenu() {
				this.$request({
					url: `/api/order/wechat/itemCls/branch/queryByTree?branchNo=${uni.getStorageSync('transBranchNo')}&channelNo=${uni.getStorageSync('channelType')}`
				}).then(res => {
					if (res?.code === 0) {
						this.menu = res.data || [];
					}
				})
			},
			// 获取商品列表
			fetchCommodityList() {
				this.isLoading = true;
				uni.showLoading({
					title: "加载中",
					mask: true
				})
				this.$request({
					type: "POST",
					url: '/api/order/wechat/item/bizPageForDelivery',
					data: {
						current: this.page,
						size: this.size,
						model: {
							itemClsno: this.subMenuKey || this.menuKey
						}
					}
				}).then(res => {
					this.isLoading = false;
					this.refreshStatus = false;
					if (res?.code === 0) {
						const {
							records = [], pages
						} = res.data;
						const finishedData = this.$utils.onSyncNumber(records);
						this.pages = pages;
						if (this.page === 1) {
							this.listData = finishedData;
						} else {
							this.listData = this.listData.concat(finishedData);
						}
						this.loadStatus = this.page < pages ? 'loadmore' : 'nomore';
						uni.hideLoading();
					}
				})
			},
			// 跳转路由
			onJump() {
				uni.navigateTo({
					url: '/packageCategory/pages/search/index'
				})
			},
			// 点击菜单事件
			onClickMenu(record) {
				if (this.menuKey !== record.itemClsno || (this.menuKey === record.itemClsno && this.subMenuKey)) {
					this.menuKey = record.itemClsno;
					this.subMenuKey = '';
					this.onSearch();
				}
			},
			// 点击子菜单事件
			onClickSubMenu(record) {
				if (this.subMenuKey !== record.itemClsno) {
					this.subMenuKey = record.itemClsno;
					this.onSearch();
				}
			},
			// 查询事件
			onSearch() {
				this.page = 1;
				this.listData = [];
				this.fetchCommodityList();
			},
			// 监听滚动事件
			onScroll(e) {
				this.realScrollTop = e.detail.scrollTop;
			},
			// 刷新数据
			onRefreshData() {
				this.refreshStatus = true;
				this.onSearch();
				setTimeout(() => {
					this.refreshStatus = false;
				}, 2000)
			},
			// 加载数据
			onLoadData() {
				if (!this.isLoading && this.page < this.pages) {
					this.page += 1;
					this.fetchCommodityList();
				}
			},
			// 查看商品
			onViewCommodity(index) {
				uni.navigateTo({
					url: `/packageCategory/pages/detail/index?detail=${encodeURIComponent(JSON.stringify(this.listData[index]))}`
				})
			},
			// 修改数量
			onModifyNumber(index, number) {
				if (number) {
					this.listData[index].itemQty = number;
				} else {
					this.listData[index].itemQty = 0;
				}
			},
			// 返回顶部
			onBackTop() {
				this.scrollTop = this.realScrollTop;
				this.$nextTick(() => {
					this.scrollTop = 0;
				});
			}
		},
		components: {
			Commodity
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		background-color: #fff;
		overflow: hidden;

		.container {
			display: flex;
			flex-direction: column;
			height: 100%;

			.nav {
				display: flex;
				flex-direction: row;
				height: 44px;
				padding-right: 120px;
				line-height: 44px;
				background-color: #377cfd;

				.title {
					width: 140rpx;
					font-size: 16px;
					font-weight: bold;
					color: #fff;
					text-align: center;
				}

				.extra {
					flex: 1;
				}
			}

			.wrapper {
				display: flex;
				flex-direction: row;
				flex: 1;
				height: 100%;
				overflow: hidden;

				.menu {
					width: 140rpx;
					height: 100%;
					text-align: center;
					background-color: #f5f5f5;

					.scroll {
						height: 100%;

						.label {
							padding: 20rpx 0;
							font-size: 24rpx;
							font-weight: bold;
							color: #666;
							line-height: 48rpx;
						}

						.children {
							background-color: #fff;

							.label {
								font-size: 22rpx;
								font-weight: normal;
								color: #999;
							}
						}

						.active {
							color: #f50 !important;
						}
					}
				}

				.main {
					flex: 1;
					overflow: hidden;

					.scroll {
						height: 100%;

						.empty {
							display: flex;
							height: 100%;
							align-items: center;
							justify-content: center;
							flex-direction: column;
						}
					}
				}
			}
		}
	}
</style>
