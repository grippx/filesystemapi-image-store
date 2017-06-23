<?php 
$url = 'http://lorempixel.com/400/400/sports/'.mt_rand(1,3).'/'.str_replace('.', '', microtime(true)).'/';
var_dump($url);
file_put_contents('pics/pic0.png', file_get_contents($url));