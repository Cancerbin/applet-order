<template>
	<view class="container">
		<view>
			<!-- 安全距离 -->
			<u-status-bar bgColor="#377cfd"></u-status-bar>
			<view class="nav">
				<view class="title" @click="onScan">
					<u-icon name="scan" color="#fff" size="64rpx" space="4rpx" label="扫码购" labelSize="24rpx"
						labelPos="right" labelColor="#fff"></u-icon>
				</view>
				<view class="extra">
					<u-search placeholder="搜索您想要的商品" :disabled="true" :showAction="false" height="28px"
						@click="onSearch">
					</u-search>
				</view>
			</view>
		</view>
		<view class="wrapper">
			<scroll-view class="scroll" scroll-y="true" :refresher-threshold="50" :refresher-triggered="triggered"
				:scroll-with-animation="true" refresher-enabled="true" @refresherrefresh="onRefresh">
				<view v-for="item in moduleList" :key="item.modelNo">
					<view :style="{marginTop: `${item.marginTop}px`, marginBottom: `${item.marginBottom}px`}">
						<!-- 轮播图 -->
						<carousel v-if="item.modelType === '0'" :detail="item" @onClick="onJump" />
						<!-- 圆形导航 -->
						<navigation v-if="item.modelType === '1'" :detail="item" @onClick="onJump" />
						<!-- 广告图 -->
						<advertise v-if="item.modelType === '2'" :detail="item" @onClick="onJump" />
						<!-- 栏目标题 -->
						<title v-if="item.modelType === '3'" :detail="item" @onClick="onJump" />
						<!-- 商品展示 -->
						<showcase v-if="item.modelType === '5'" :detail="item" />
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import carousel from '@/components/carousel/index.vue';
	import navigation from '@/components/navigation/index.vue';
	import advertise from '@/components/advertise/index.vue';
	import title from '@/components/title/index.vue';
	import showcase from '@/components/showcase/index.vue';
	export default {
		data() {
			return {
				triggered: false,
				moduleList: []
			}
		},
		onLoad() {
			this.fetchModule();
		},
		onShow() {
			this.$utils.updateCart();
		},
		methods: {
			// 获取首页模块
			fetchModule() {
				uni.showLoading({
					title: '加载中',
					mask: true
				})
				const userInfo = uni.getStorageSync('userInfo');
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/homeTemplateModel/queryHomeModel',
					data: {
						channelType: uni.getStorageSync('channelType'),
						transBranchNo: uni.getStorageSync('transBranchNo')
					}
				}).then(res => {
					this.triggered = false;
					if (res?.code === 0) {
						this.moduleList = res.data;
						uni.hideLoading();
						this.fetchIntegral();
					}
				})
			},
			// 登录领取积分
			fetchIntegral() {
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/jifen/addLoginJifen',
					data: {},
					intercept: false
				}).then(res => {
					if (res?.code === 0) {
						uni.showToast({
							icon: 'success',
							title: '登录积分领取成功'
						})
					}
				})
			},
			// 扫码事件
			onScan() {
				uni.navigateTo({
					url: '/packageCategory/pages/search/index?scan=true'
				})
			},
			// 查询事件
			onSearch() {
				uni.navigateTo({
					url: '/packageCategory/pages/search/index'
				})
			},
			// 下拉刷新
			onRefresh() {
				this.triggered = true;
				this.fetchModule();
			},
			// 跳转路由
			onJump(detail, record) {
				switch (record.linkType) {
					case '2':
						// 跳转商品详情
						uni.showLoading({
							title: "搜索中",
							mask: true
						})
						this.$request({
							type: 'POST',
							url: '/api/order/wechat/homeTemplateModel/queryHomeModelItemList',
							data: {
								detailId: record.id,
								modelNo: detail.modelNo,
								branchNo: uni.getStorageSync('transBranchNo')
							}
						}).then(res => {
							uni.hideLoading();
							if (res?.code === 0) {
								if (res?.data?.length) {
									const cacheList = uni.getStorageSync('cacheList') || [];
									const cacheIndex = cacheList.findIndex(item => item.itemNo === res.data[0]
										.itemNo);
									const params = {
										...res.data[0],
										itemQty: cacheIndex < 0 ? 0 : cacheList[cacheIndex].itemQty
									}
									uni.navigateTo({
										url: `/packageCategory/pages/detail/index?detail=${encodeURIComponent(JSON.stringify(params))}`
									})
								} else {
									uni.showModal({
										title: '提示',
										content: '未查找到链接商品',
										showCancel: false
									});
								}
							}
						})
						break;

					case '3':
						uni.navigateTo({
							url: '/pages/home/activity/index?record=' + encodeURIComponent(
								JSON.stringify({
									...record,
									modelNo: detail.modelNo
								}))
						})
						break;

					case '6':
						uni.navigateTo({
							url: '/packageHome/pages/spike/index'
						})
						break;

					case '7':
						uni.navigateTo({
							url: '/packageMine/pages/group/index'
						})
						break;

					case '8':
						uni.navigateTo({
							url: '/packageHome/pages/coupon/index'
						})
						break;

					case '9':
						uni.navigateTo({
							url: '/packageHome/pages/exchange/index'
						})
						break;

					default:
						break;
				}
			}
		},
		components: {
			advertise,
			carousel,
			navigation,
			title,
			showcase
		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
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
					display: flex;
					width: 154rpx;
					align-items: center;
				}

				.extra {
					flex: 1;
				}
			}

			.wrapper {
				flex: 1;
				height: 100%;
				overflow: hidden;

				.scroll {
					height: 100%;
				}
			}
		}
	}
</style>
