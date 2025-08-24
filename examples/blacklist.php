<?php
error_reporting(255);
/*
Mysql connect settings:
*/
$mysql_user='';
$mysql_password='';
$mysql_database='';
/*
SQL table:
CREATE TABLE `blacklist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account` varchar(255) NOT NULL,
  `block_id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `initiator` varchar(255) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0 COMMENT '1=enable',
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `time` (`time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;
*/

/*
VIZ class from https://github.com/VIZ-Blockchain/viz-php-lib
Passwordless auth for domain and api-node
*/
$viz_auth_domain='readdle.me';
$viz_api_node='https://api.viz.world/';
include('./class/autoloader.php');
$viz_auth=new VIZ\Auth($viz_api_node,$viz_auth_domain);
//specific setting to ignore ssl handshake for speed up servers in one network
$viz_auth->jsonrpc->check_ssl=false;

//add CORS for OPTIONS header
if('OPTIONS'==$_SERVER['REQUEST_METHOD']){
	http_response_code(200);//OK
	header('Access-Control-Allow-Headers: DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range');
	header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Expose-Headers: Content-Length');
	exit;
}

$response=[];
//jsonRPC from input post body
$request=file_get_contents('php://input');
$request_arr=json_decode($request,true);
if(JSON_ERROR_NONE!==json_last_error()){
	$response['error']=true;
	$response['result']=false;
	header('Access-Control-Allow-Origin: *');
	header('Content-Type: application/json');
	print json_encode($response);
	exit;
}
$ttl=60*10;//10min

$db=mysqli_connect('localhost',$mysql_user,$mysql_password);
mysqli_select_db($db,$mysql_database);
mysqli_set_charset($db,'utf8mb4');

$auth_status=false;
$account=false;
if(isset($request_arr['session'])){
	$q=@mysqli_query($db,"SELECT `account` FROM `session` WHERE `id`=UNHEX('".mysqli_real_escape_string($db,$request_arr['session'])."') AND `time`>'".time()."'");
	$m=@mysqli_fetch_assoc($q);
	if(isset($m['account'])){
		$account=$m['account'];
		$auth_status=true;
	}
	else{
		$response['session']='';
		$response['expire']=-1;
		$response['error']=true;
		$response['result']=false;
		$auth_status=false;
	}
}
if(isset($request_arr['signature'])){
	$auth_status=$viz_auth->check($request_arr['data'],$request_arr['signature']);
	if($auth_status){
		$data=explode(':',$request_arr['data']);
		$account=$data[2];
	}
}
$response['auth']=$auth_status;
if($auth_status){
	$error=false;
	$action=$request_arr['action'];

	if('updates'==$action){
		$time=$request_arr['time'];
		$result=[];
		$q=@mysqli_query($db,'SELECT * FROM `blacklist` WHERE `status`=1 AND `time`>=\''.intval($time).'\' LIMIT 250');
		while($m=@mysqli_fetch_assoc($q)){
			if($m['id']>$offset){
				$result[]=[
					'account'=>$m['account'],
					'block_id'=>$m['block_id'],
					'type'=>0,//0=block,1=unblock
					'initiator'=>$m['initiator'],
					'reason'=>$m['reason'],
					'time'=>$m['time'],
				];
			}
		}
		$response['result']=$result;
	}
	else
	if('report'==$action){
		if($account==$request_arr['initiator']){
			//$request_arr['type']=(intval($request_arr['type'])==0?0:1);//0 as default as just block report
			$request_arr['block_id']=intval($request_arr['block_id']);

			$result=[];
			$time=time();
			$q=@mysqli_query($db,'INSERT INTO `blacklist`
			(`account`,`block_id`,`type`,`initiator`,`reason`,`time`) VALUES
			(\''.mysqli_real_escape_string($db,$request_arr['account']).'\','.$request_arr['block_id'].',0,\''.mysqli_real_escape_string($db,$request_arr['initiator']).'\',\''.mysqli_real_escape_string($db,$request_arr['reason']).'\',\''.$time.'\')');
			$last_id=mysqli_insert_id($db);

			$response['result']=[
				'time'=>$time,
			];
		}
		else{
			$error=true;//initiator not equal session account
		}
	}
	else{
		$error=true;
	}
	if($error){
		$response['error']=true;
		$response['result']=false;
	}
	$response['request']=$request_arr;
}
else{
	$response['request']=$request_arr;
}

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
print json_encode($response);