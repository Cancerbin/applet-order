<script>
	export default {
		data() {
			return {
				counter: {}
			}
		},
		globalData: {
			clock: null,
			// 缓存队列
			cache: {}
		},
		onLaunch: function() {
			this.onVerifyLogin();
		},
		onShow: function() {
			// 检测版本更新
			this.onCheckVersion();
			// 更新购物车
			this.globalData.clock = setInterval(() => {
				this.updateCart();
			}, 1500);
		},
		onHide: function() {
			clearInterval(this.globalData.clock);
			this.globalData.clock = null;
		},
		methods: {
			// 检测登录状态
			onVerifyLogin() {
				const token = uni.getStorageSync('token');
				const branchNo = uni.getStorageSync('branchNo');
				const expiration = uni.getStorageSync('expiration');
				// 判断是否已经登录
				if (token && branchNo && expiration) {
					const localTime = new Date().getTime();
					const expirationTime = new Date(expiration.replace(/-/g, '/')).getTime();
					// 判断是否登录超时
					if (localTime >= expirationTime) {
						this.$utils.logout();
					}
				} else {
					this.$utils.logout();
				}
			},
			// 版本检测
			onCheckVersion() {
				if (wx.canIUse('getUpdateManager')) {
					const VersionDetection = wx.getUpdateManager();
					// 版本检测
					VersionDetection.onCheckForUpdate((res) => {
						if (res.hasUpdate) {
							VersionDetection.onUpdateReady(() => {
								uni.showModal({
									title: '版本更新',
									content: '当前小程序有版本更新，即将重启',
									showCancel: false,
									success: function(res) {
										if (res.confirm) {
											VersionDetection.applyUpdate();
										}
									}
								})
							})
						}
					})
				}
			},
			// 更新购物车
			updateCart() {
				const requestList = Object.keys(this.globalData.cache);
				if (requestList.length) {
					requestList.forEach(item => {
						const number = this.globalData.cache[item];
						if (number) {
							this.updateNumber(item, number);
						} else {
							this.deleteItem(item);
						}
					})
				}
			},
			// 更新数量
			updateNumber(itemNo, number) {
				this.$request({
					type: 'POST',
					url: '/api/order/wechat/shopCart',
					data: {
						itemNo: itemNo,
						itemQty: number,
						branchNo: uni.getStorageSync('branchNo'),
						transBranchNo: uni.getStorageSync('transBranchNo'),
						transType: 0,
					},
					intercept: false
				}).then(res => {
					if (res?.code === 0) {
						const cacheList = uni.getStorageSync('cacheList') || [];
						const cacheIndex = cacheList.findIndex(row => row.itemNo === itemNo);
						if (cacheIndex >= 0 && cacheList[cacheIndex].itemQty === number) {
							delete this.globalData.cache[itemNo];
							delete this.counter[itemNo];
						}
					} else if (res.code === -20) {
						delete this.globalData.cache[itemNo];
					} else {
						if (this.counter[itemNo] === undefined) {
							this.counter[itemNo] = 0;
						} else if (this.counter[itemNo] > 2) {
							delete this.globalData.cache[itemNo];
							delete this.counter[itemNo];
						} else {
							this.counter[itemNo] += 1;
						}
					}
				})
			},
			deleteItem(itemNo) {
				this.$request({
					type: 'DELETE',
					url: `/api/order/wechat/shopCart/deleteItem/0/${uni.getStorageSync('transBranchNo')}/${itemNo}`,
					intercept: false
				}).then(res => {
					if (res?.code === 0) {
						const cacheList = uni.getStorageSync('cacheList') || [];
						const cacheIndex = cacheList.findIndex(row => row.itemNo === itemNo);
						if (cacheIndex < 0) {
							delete this.globalData.cache[itemNo];
							delete this.counter[itemNo];
						}
					} else if (res.code === -20) {
						delete this.globalData.cache[itemNo];
					} else {
						if (this.counter[itemNo] === undefined) {
							this.counter[itemNo] = 0;
						} else if (this.counter[itemNo] > 2) {
							delete this.globalData.cache[itemNo];
							delete this.counter[itemNo];
						} else {
							this.counter[itemNo] += 1;
						}
					}
				})
			}
		}
	}
</script>

<style>
	page {
		background-color: #f0f0f0;
	}
</style>
