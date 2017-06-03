<?php 
class ApiClass
{
	function __construct(){
		header('Access-Control-Allow-Origin:*'); // 指定允许其他域名访问  
		header('Access-Control-Allow-Methods:POST,GET'); // 响应类型   
		header('Access-Control-Allow-Headers:x-requested-with,content-type');  // 响应头设置 
		header("Content-type:text/html;charset=utf-8");
		if(isset($_POST['item'])&&isset($_POST['vision'])){
			$item   = trim(strip_tags($_POST['item']));
			$vision = trim(strip_tags($_POST['vision']));//版本（1:标准，2:简版）
			$url = "http://weixin.sogou.com/pcindex/pc/pc_$item/pc_$item.html";
			if(isset($_POST['page'])&&$_POST['page']!=0){
				$page = trim(strip_tags($_POST['page']));
				$url = "http://weixin.sogou.com/pcindex/pc/pc_$item/$page.html";
			}
			$this->get_data($url,$vision);
		}else{
			$this->json(0,"参数错误");
		}
	}

	/*json 格式返回数据*/
	function json($status=0, $info = '', $data=null) {
		if(!is_numeric($status)) {
			return '';
		}
		$result = array(
			'status' => $status,
			'info' => $info,
			'data' => $data
			);
		echo json_encode($result);
		exit;
	}

	/*获得数据*/
	function get_data($url,$vision=1){
		$ch = curl_init();
		curl_setopt($ch,CURLOPT_URL,$url);
		curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch,CURLOPT_HEADER,0);
		$output = curl_exec($ch);
		curl_close($ch);
		$output = preg_replace('/<span id=\"signature\".*?>.*?<\/span>/ism', "", $output);
		$output = preg_replace('/<p class=\"txt-info\".*?>.*?<\/p>/ism', "", $output);
		$output = preg_replace('/onload=\"resizeImage\(this\)\"/', "", $output);
		$output = preg_replace('/onerror=\"errorImage\(this\)\"/', "", $output);
		$output = preg_replace('/<div class=\"moe-box\">.*?>.*?<\/div>/ism', "", $output);
		if($vision==2){  //简版
			$output = preg_replace('/<img src/', "<img data-src", $output);
		}
		if($output){
			$this->json(1,"获取成功",$output);
		}else{
			$this->json(0,"获取失败");
		}
	}
}
new ApiClass();