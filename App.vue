<script>
	export default {
		onLaunch: function() {
			this.$utils.onVerifyLogin();
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
