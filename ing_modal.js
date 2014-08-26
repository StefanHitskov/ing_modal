jQuery(document).ready(function($){
// ing_modal.js
// by Ing 
// кручу-верчу, чтоб работало хачу
// last-update 21.08-2014
// attr = mailto  ( <a href="" class="mform" mailto="some@email.com"> )


//настройки
    var modal_selector = '.myModal';

//var mail_to = 'gk-dunai@mail.ru';
    var mail_to = 'ingvar.losev@gmail.com';
    var mail_from = 'no-replay@gk-dunai.ru';
    var mail_subject = 'Заявка - Обратный звонок';

    var hasName = true;
    var hasPhone = true;
    var hasComment = false;
    var hasEmail = true;
    var canSendFile = false;
    var pathResivedFile = '';

    var win_tilte = 'Остались вопросы?';
    var win_h2 = 'Оставить заявку';
    var send_text = 'Отправить';
    var modal_text = 'Ваше сообщение отправлено<br>Cпасибо!';

    var title_color = '#E8E8E8';
    var title_font_color = '#000';
    var closeBg_Color = '#464646';
    var closeBg_ColorHover = '#429ADB';
    var h2_color = '#000';
    var inputs_color = '#000';
    var form_width = '300px';
    var input_fColor = '#fff';
    var input_fColorHover = '#fff';
    var ing_debag = true;

//шаблон формы
    var form_code =
        '<div id="imd_form">'+
            '<form class="imd" method="post" action="" enctype="multipart/form-data">';
    if ( hasName ){ form_code += '<input name="name" type="text" required placeholder="Имя*" value="" />';}
    if ( hasPhone ){ form_code +=  '<input name="telefon" type="text" required placeholder="Телефон*" value="" />';}
    if ( hasEmail ){
        form_code += '<input name="pochta" type="text" placeholder="Ваш email" value="" />';
        form_code += '<input name="email" type="text" placeholder="Ваш email" value="" style = "display:none;"/>'; //поле проверки на робота
    }
    if ( hasComment ) { form_code += '<textarea name="comment" type="text" placeholder="Комментарий" />'; }
    if (canSendFile){
        form_code += '<input name="uploadFile" type="file" />';
    }
    form_code +=
        '<div style="text-align:center;width:90%;padding:1px;margin:0;"><input type="submit"  value="'+send_text+'" /></div>'+
            '</form>'+
            '</div>';



// - дальше лучше ничего не трогать :)

    var win_frame =
        '<div id="win_frame">'+
            '<div id="title"></div><div id="close"></div>'+
            '<div id="content"><h2></h2></div>'+
            '</div>';

    var win_bg = '<div id="win_bg"></div>';



    find_objects();


    function find_objects(){
        if ($(modal_selector).length > 0){
            if ($('#imd_form').length <= 0){create_form();}
            $(modal_selector).on('click',function(e){
                if ($(this).attr('mailto') != null ){ window.ing_mail_to = $(this).attr('mailto'); }
                show_form();
                return false;
            });
        }
    }


    function findPHPmail(pathNotSet){
        var basePath = $('script[src*=ing_modal]').attr('src');
        if (pathNotSet){
            return basePath.replace('ing_modal.js', '')+'uploads/';
        }
        else{
            return basePath.replace('ing_modal.js', '')+'ing_mail.php';
        }
    }


    function show_form(){
        $('#win_bg').fadeIn(300);
        $('#win_frame > #title').text(win_tilte);
        $('#win_frame > #content > h2').text(win_h2);
        formToCenter($('#win_frame'));
    }

    function form_prepare(){
        if (ing_debag){qwe('form prepare::');}
        //file
        if ( pathResivedFile != null ){
            $('form.imd').eq(0).append('<input name="uploadDir" type="hidden" value="'+pathResivedFile+'" />');
        }
        if ( canSendFile && pathResivedFile == null ){
            $('form.imd').eq(0).append('<input name="uploadDir" type="hidden" value="'+findPHPmail(true)+'" />');
        }

        //for mail
        if (window.ing_mail_to != null){
            $('form.imd').eq(0).append('<input name="mail_to" type="hidden" value="'+window.ing_mail_to+'" />');
        } else {
            $('form.imd').eq(0).append('<input name="mail_to" type="hidden" value="'+mail_to+'" />');
        }
        $('form.imd').eq(0).append('<input name="mail_from" type="hidden" value="'+mail_from+'" />');
        $('form.imd').eq(0).append('<input name="mail_subject" type="hidden" value="'+mail_subject+'" />');
    }


    function send_form(obj){
        form_prepare();
        //robot detect
        email_for_bot = $('.imd input[name=email]').val();
        if (email_for_bot != ''){ qwe('bot::'+email_for_bot); return false; }

        var formData = new FormData($('form.imd')[0]);
        $.ajax({
            type: "POST",
            processData: false,
            contentType: false,
            url: findPHPmail(false),
            data: formData
        })
            .done(function( data ) {
                data = data.trim();
                if (data=="Ok!"){
                    $('#win_bg').fadeOut(600);
                    clear_form($(obj));
                    mail_sent_modal(modal_text);
                }
            });

    }

    function clear_form(obj){
        $(obj).find('input[type=text], textarea').val('');
    }

    function mail_sent_modal(text){
        if ($('#imd_message').length <= 0){
            $('body').append('<div id="imd_message"><p></p></div>');
            set_css('modal');
        }
        $('#imd_message').find('p').html(text);
        formToCenter($('#imd_message'));
        $('#imd_message').stop( true, true ).fadeIn(800).delay(3000).fadeOut(600);
    }


    function formToCenter(obj){
        var wh=$(window).height() / 2;
        var ww=$(window).width() / 2;
        var oh = $(obj).outerHeight(true)/2;
        var ow = $(obj).outerWidth(true)/2
        var ot = wh-oh+'px';
        var ol = ww-ow+'px';
        $(obj).css({'top':ot,'left':ol});
    }

    function create_form(){
        if ($('#win_bg').length <= 0){
            $('body').prepend(win_bg);
            $('#win_bg').append(win_frame);
            $('#win_bg > #win_frame > #content').append(form_code);
            set_events();
            set_css('global');
        }
    }



    function set_events(){
        $('#win_bg, #win_frame > #close').on('click',function(e){
            var cur_obj_id = $(e.target).attr('id');
            if (cur_obj_id=='win_bg' || cur_obj_id=='close' ){$('#win_bg').fadeOut(400);}
        });
        $('form.imd').on('submit',function(){
            send_form($(this));
            return false;
        })
    }

    function set_css(type){
        if (type!='modal'){
            $('#win_bg').css({
                'position':'fixed',
                'z-index':'900',
                'width':'100%',
                'height':'100%',
                'background-color':'rgba(255,255,255,0.6)',
                'display':'none'
            });	}
        $('#win_frame').css({
            'border':'1px solid rgba(96, 64, 43,0.7)',
            'width':form_width,
            'position':'fixed',
            'background-color':'#fff',
            'border-radius':'4px',
            'box-shadow':'3px 3px 6px 0px rgba(9, 0, 21, 0.85)'
        });
        $('#win_frame > #title').css({'padding':'5px 10px 0','height':'20px','text-transform':'uppercase','background-color':title_color,'font':'10px "Arial"','color':title_font_color,
            'border-top-left-radius':'4px',
            'border-top-right-radius':'4px'
        });
        $('#win_frame > #close').css({
            'width':'25px',
            'height':'25px',
            'top':'0',
            'left':'90%',
            'position':'absolute',
            'background-color':closeBg_Color,
            'color':'#000',
            'transition': 'background-color 0.5s ease 0s',
            'background-repeat':'no-repeat',
            'background-position':'center ',
            'cursor':'pointer',
            "background-image":"url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NEI2Q0U2QTRFQ0I0MTFFMzkxREJENzQ2RUUzOTI4QTYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NEI2Q0U2QTVFQ0I0MTFFMzkxREJENzQ2RUUzOTI4QTYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo0QjZDRTZBMkVDQjQxMUUzOTFEQkQ3NDZFRTM5MjhBNiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo0QjZDRTZBM0VDQjQxMUUzOTFEQkQ3NDZFRTM5MjhBNiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlbhRhcAAACZSURBVHjanJIxDoAgDEXBxUU35T6e3SOgp9DEQQed6sfUBLF0gOQNyn+ElloiMlgtqMFq9NWBExwGYgNGMIE+HJSh50zINvEPUuRf5t1wipxK7ikvCjghIEqpKMnZEqQmxHK27kpoOTHxt5D6d88LV/XaVVMpbc5Hzr6T9oavWDQAFc/eBmYwgEVoxcJ7M2dPWzDkF9hvAQYASUHtOTSpBOsAAAAASUVORK5CYII=')"
        });
        $('#win_frame > #close').hover(
            function(){$(this).css({'background-color':closeBg_ColorHover});},
            function(){$(this).css({'background-color':closeBg_Color});}
        );
        //transparent

        $('#content input[type="submit"]').hover(
            function(){$(this).css({'background-color':closeBg_ColorHover,'color':input_fColorHover,'width':'220px','text-shadow':'2px 2px 2px rgba(0, 0, 0, 1)'});},
            function(){$(this).css({'background-color':closeBg_Color,'color':input_fColor,'width':'200px','text-shadow':'1px 1px 2px transparent'});}
        );


        $('#win_frame > #content').css({'padding':'15px','float':'none','width':'100%','left':'0','position':'relative','margin':'0'});
        $('#content h2').css({'margin':'0 0 10px', 'text-transform':'uppercase','font':'16px','color':h2_color});
        $('#content :input').css({
            'padding':'10px',
            'margin':'5px 0',
            'width':'83%',
            'color':inputs_color,
            'font':'14px "Arial"'
        });



        $('#content input[type="submit"]').css({
            'width':'200px',
            'margin':'5px auto 0',
            'cursor':'pointer',
            'color':input_fColor,
            'transition': 'background-color 0.5s ease 0s, color 0.8s ease 0.0s, width 0.3s ease 0.0s, text-shadow 0.3s ease 0.0s',
            'background-color':closeBg_Color,
            'text-transform':'uppercase',
            'border-radius':'5px',
            'font-size':'16px'
        });

        $('#content textarea').css({'height':'100px','color':inputs_color,'padding':'10px','font':'14px "Arial"','margin':'5px 0','resize':'none'});
        $('#content input[name="email"]').css({	'display':'none'});
        $('#imd_message').css({
            'display':'none',
            'position':'fixed',
            'padding':'15px 25px',
            'border':'1px solid #000',
            'background-color':'#fff',
            'border-radius':'5px',
            'z-index':'999',
            'color':'#000'
        });
        $('#imd_message p').css({'font-size':'14px','margin':'0','padding':'0'});

    }

    qwe('ing_modal started;');

    if (ing_debag){
        qwe ('selector::'+modal_selector);
        qwe ( 'form_code::'+form_code );


    }

});

function qwe(a){
    console.log(a);

}