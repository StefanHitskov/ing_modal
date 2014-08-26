	<?php
			// простенько, и почти со вкусом :)


			$to = "ingvar.losev@gmail.com, ingvar.losev@hotmail.com, ingvar.work@yandex.ru";
			$from = "info@lesnoiregion.ru";
			$subject = "Сообщение с сайта lesnoiregion.ru";

			if (isset($_REQUEST['telefon'])){$phone = $_REQUEST['telefon'];}
			if (isset($_REQUEST['name'])){$name = $_REQUEST['name'];}
			if (isset($_REQUEST['pochta'])){$email = $_REQUEST['pochta'];}
			if (isset($_REQUEST['comment'])){$comment = $_REQUEST['comment'];}
			
			$message =	'<html>
				<head>
					<style type="text/css">
						td{
							border-bottom:1px dotted #000000;
							border-left:none;
							border-right:none;
							padding:5px 10px;
							font-family:arial,sans-serif;
							font-size:14px;
						}
					</style>
				</head>
				<body>
				<h3>Заявка</h3><hr>
				<table border="0">';

				if (isset($name)){$message .= '<tr><td><strong>'.$name.'</strong></td></tr>';}
				if (isset($phone)){$message .= '<tr><td><strong>'.$phone.'</strong></td></tr>';}
				if (isset($email)){$message .= '<tr><td><strong>'.$email.'</strong></td></tr>';}
				if (isset($comment)){$message .= '<tr><td><strong>'.$comment.'</strong></td></tr>';}
				$message .= '</table></body></html>';


				//----- если есть файлы--------------------------------
				$bound="--".md5(uniqid(time())); //разделитель
				if ($_FILES['uploadFile']['tmp_name']!=''){
					if (isset($_REQUEST['uploadDir'])){$uploadDir = $_SERVER['DOCUMENT_ROOT'].$_REQUEST['uploadDir'];}
					if(!is_dir($uploadDir)){ 
						if(!mkdir($uploadDir, 0777)){echo 'нешмагла я, нешмагла';}
					} 
						$uploadFile = $uploadDir.basename($_FILES['uploadFile']['name']);

						if (copy($_FILES['uploadFile']['tmp_name'], $uploadFile)){			
							//echo "<h3>Файл успешно загружен на сервер</h3>";
						} else 
							{ echo "<h3>Ошибка! Не удалось загрузить файл на сервер!</h3>";  }	
				
					$filePart = '';	
					if(file_exists($uploadFile)){
						$fp = fopen($uploadFile, "r");
						if(!fp)	{    
							print "<center><b>Извините, сервер временно не отправляет письма, попробуйте позже.</b></center>";
							exit();
						}
						$file = fread($fp, filesize($uploadFile));
						fclose($fp); @unlink($uploadFile);
						
						$filePart.="--$bound\n";
						$filePart.="Content-Type: application/x-myapplication\n";
						$filePart.="Content-Transfer-Encoding: base64\n";
						$filePart.="Content-Disposition: attachment; 
									filename=\"" . $_FILES['uploadFile']['name'] . "\"\n\n";
						$filePart.=chunk_split(base64_encode($file))."\n";
					} else {
						echo 'nema fila';
					}
				}



				//-------------- формируем письмо -----------------------
				$headers = "MIME-Version: 1.0\n";
				$headers.= "Content-Type: multipart/mixed; boundary=\"$bound\"\n";
				$headers.= "From: ".$from."\r\n".
				$headers.= "X-Mailer: PHP/" . phpversion();

				$multipart="--$bound\n";
				$multipart.="Content-Type: text/html; charset=utf-8\r\n";
				$multipart.="Content-Transfer-Encoding: Quot-Printed\r\n\r\n";
				$multipart.= $message . "\n\n";

				if ($_FILES['uploadFile']['tmp_name']!=''){ $multipart.=$filePart."--$bound--\n"; }

				$subject = "=?utf-8?B?".base64_encode($subject)."?="; 		
				$mail_status = mail($to,$subject,$multipart,$headers);
				if ($mail_status){echo 'Ok!';}

