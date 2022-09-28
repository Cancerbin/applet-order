<script>
	export default {
		onLaunch: function() {
			this.onVerifyLogin();
		},
		onShow: function() {
			// 检测版本更新
			this.onCheckVersion();
		},
		onHide: function() {
			console.log('App Hide')
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
			}
		}
	}
</script>

<style>
	page {
		background-color: #f0f0f0;
	}
</style>
