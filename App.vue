<script>
	export default {
		onLaunch: function() {
			const token = uni.getStorageSync('token');
			const branchNo = uni.getStorageSync('branchNo');
			// 判断是否已经登录
			if (token && branchNo) {
				uni.switchTab({
					url: '/pages/home/index'
				})
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	page {
		background-color: #f0f0f0;
	}
</style>
