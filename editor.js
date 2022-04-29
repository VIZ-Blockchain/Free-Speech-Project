var editor_version = 1;

function inside_editor_formatter(target){
	return (1==$(target).closest('.editor-formatter').length);
}

function editor_formatter_actions(e,target){
	//go parent element, if event on icon
	if($(target).hasClass('icon')){
		target=$(target).parent();
	}
	if($(target).hasClass('editor-reset-action')){
		e.preventDefault();
		let confirm_reset=confirm(ltmp_editor.editor_reset_caption+'?');
		if(confirm_reset){
			$('.article-editor .editor-text').html('<h1><br></h1><p><br></p>');
			$('.article-settings input[name="description"]').val('');
			$('.article-settings input[name="thumbnail"]').val('');
			$('.article-settings .beneficiaries-list .beneficiaries-item').each(function(i,el){
				$(el).find('input[name="account"]').val('');
				$(el).find('input[name="weight"]').val('');
				if(i>0){
					el.remove();
				}
			});
			$('.article-settings input[name="edit-event-object"]').val('');

			$('.editor-placeholders').find('h1').removeClass('hidden');
			$('.editor-placeholders').find('p').removeClass('hidden');
			editor_change();
			setTimeout(function(){
				editor_clear_elements(editor,0);
			},10);
			clearTimeout(editor_save_draft_timer);
			editor_save_draft_timer=setTimeout(function(){
				editor_save_draft();
			},20);

		}
	}
	if($(target).hasClass('editor-separator-action')){
		if(!$(target).hasClass('disabled')){
			e.preventDefault();
			document.execCommand('insertHTML',false,'<hr /><p id="new_selection_temp">&nbsp;</p>');
			let selection=document.getSelection();
			let new_selection_temp=document.getElementById('new_selection_temp');
			let range=document.createRange();
			range.selectNodeContents(new_selection_temp);
			selection.removeAllRanges();
			selection.addRange(range);
			new_selection_temp.removeAttribute('id');
			new_selection_temp.innerHTML='';
			editor_change();
		}
	}
	if($(target).hasClass('editor-ul-action')){
		if(!$(target).hasClass('disabled')){
			e.preventDefault();
			let selection=document.getSelection();
			if(typeof selection !== "undefined"){
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					let parent_element=$(selection.focusNode.parentNode)[0];
					let parent_element_type=parent_element.nodeName;
					if('DIV'==parent_element_type){
						parent_element=$(selection.focusNode)[0];
						parent_element_type=parent_element.nodeName;
					}
					let subparent_element=$(parent_element)[0].parentNode;
					let subparent_element_type=subparent_element.nodeName;
					//console.log('action ul: parent_element_type',parent_element_type);
					//console.log('action ul: subparent_element_type',subparent_element_type);
					let old_parent_type=false;
					let new_parent_type=false;
					$('.editor-formatter > a.editor-ul-action').removeClass('positive');
					$('.editor-formatter > a.editor-ol-action').removeClass('positive');
					if('P'==parent_element_type){
						old_parent_type='p';
						new_parent_type='li';

						$('.editor-formatter > a.editor-ul-action').addClass('positive');
					}
					else
					if('LI'==parent_element_type){
						old_parent_type='li';
						new_parent_type='p';
					}
					else
					if('UL'==parent_element_type){
						old_parent_type='ul';
						new_parent_type='p';
					}
					let html=parent_element.outerHTML;
					html=fast_str_replace('<'+old_parent_type+'>','',html);
					html=fast_str_replace('</'+old_parent_type+'>','',html);
					let outer_html='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
					//console.log('action ul:',old_parent_type,new_parent_type,outer_html);
					if('li'==new_parent_type){
						outer_html='<ul>'+outer_html+'</ul>';
						parent_element.outerHTML=outer_html;
					}
					if('li'==old_parent_type){
						if('p'==new_parent_type){
							parent_element.outerHTML='';
							subparent_element.outerHTML=subparent_element.outerHTML+outer_html;
						}
					}
					if('ul'==old_parent_type){
						html=fast_str_replace('<li>','',html);
						html=fast_str_replace('</li>','',html);
						outer_html='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
						parent_element.outerHTML=outer_html;
					}
					$('.editor-text')[0].focus();

					editor_change();

					let new_selection_temp=document.getElementById('new_selection_temp');
					let range=document.createRange();
					range.selectNodeContents(new_selection_temp);
					selection.removeAllRanges();
					selection.addRange(range);
					new_selection_temp.removeAttribute('id');
				}
			}
		}
	}
	if($(target).hasClass('editor-ol-action')){
		if(!$(target).hasClass('disabled')){
			e.preventDefault();
			let selection=document.getSelection();
			if(typeof selection !== "undefined"){
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					let parent_element=$(selection.focusNode.parentNode)[0];
					let parent_element_type=parent_element.nodeName;
					if('DIV'==parent_element_type){
						parent_element=$(selection.focusNode)[0];
						parent_element_type=parent_element.nodeName;
					}
					let subparent_element=$(parent_element)[0].parentNode;
					let subparent_element_type=subparent_element.nodeName;
					//console.log('action ul: parent_element_type',parent_element_type);
					//console.log('action ul: subparent_element_type',subparent_element_type);
					let old_parent_type=false;
					let new_parent_type=false;
					$('.editor-formatter > a.editor-ul-action').removeClass('positive');
					$('.editor-formatter > a.editor-ol-action').removeClass('positive');
					if('P'==parent_element_type){
						old_parent_type='p';
						new_parent_type='li';

						$('.editor-formatter > a.editor-ol-action').addClass('positive');
					}
					else
					if('LI'==parent_element_type){
						old_parent_type='li';
						new_parent_type='p';
					}
					else
					if('OL'==parent_element_type){
						old_parent_type='ol';
						new_parent_type='p';
					}
					let html=parent_element.outerHTML;
					html=fast_str_replace('<'+old_parent_type+'>','',html);
					html=fast_str_replace('</'+old_parent_type+'>','',html);
					let outer_html='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
					//console.log('action ul:',old_parent_type,new_parent_type,outer_html);
					if('li'==new_parent_type){
						outer_html='<ol>'+outer_html+'</ol>';
						parent_element.outerHTML=outer_html;
					}
					if('li'==old_parent_type){
						if('p'==new_parent_type){
							parent_element.outerHTML='';
							subparent_element.outerHTML=subparent_element.outerHTML+outer_html;
						}
					}
					if('ol'==old_parent_type){
						html=fast_str_replace('<li>','',html);
						html=fast_str_replace('</li>','',html);
						outer_html='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
						parent_element.outerHTML=outer_html;
					}
					$('.editor-text')[0].focus();

					editor_change();

					let new_selection_temp=document.getElementById('new_selection_temp');
					let range=document.createRange();
					range.selectNodeContents(new_selection_temp);
					selection.removeAllRanges();
					selection.addRange(range);
					new_selection_temp.removeAttribute('id');
				}
			}
		}
	}
	if($(target).hasClass('editor-header2-action')){
		if(!$(target).hasClass('disabled')){
			e.preventDefault();
			let selection=document.getSelection();
			if(typeof selection !== "undefined"){
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					let parent_element=$(selection.focusNode.parentNode)[0];
					let parent_element_type=parent_element.nodeName;
					if('DIV'==parent_element_type){
						parent_element=$(selection.focusNode)[0];
						parent_element_type=parent_element.nodeName;
					}
					let old_parent_type=false;
					let new_parent_type=false;
					$('.editor-formatter > a.editor-header2-action').removeClass('positive');
					$('.editor-formatter > a.editor-header3-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive-alt');
					if('P'==parent_element_type){
						old_parent_type='p';
						new_parent_type='h2';

						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('CITE'==parent_element_type){
						old_parent_type='cite';
						new_parent_type='h2';
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('BLOCKQUOTE'==parent_element_type){
						old_parent_type='blockquote';
						new_parent_type='h2';
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('H3'==parent_element_type){
						old_parent_type='h3';
						new_parent_type='h2';
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('H2'==parent_element_type){
						old_parent_type='h2';
						new_parent_type='p';
					}
					let html=parent_element.outerHTML;
					html=fast_str_replace('<'+old_parent_type+'>','',html);
					html=fast_str_replace('</'+old_parent_type+'>','',html);
					parent_element.outerHTML='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
					$('.editor-text')[0].focus();

					editor_change();

					let new_selection_temp=document.getElementById('new_selection_temp');
					let range=document.createRange();
					range.selectNodeContents(new_selection_temp);
					selection.removeAllRanges();
					selection.addRange(range);
					new_selection_temp.removeAttribute('id');
				}
			}
		}
	}
	if($(target).hasClass('editor-header3-action')){
		if(!$(target).hasClass('disabled')){
			e.preventDefault();
			let selection=document.getSelection();
			if(typeof selection !== "undefined"){
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					let parent_element=$(selection.focusNode.parentNode)[0];
					let parent_element_type=parent_element.nodeName;
					if('DIV'==parent_element_type){
						parent_element=$(selection.focusNode)[0];
						parent_element_type=parent_element.nodeName;
					}
					let old_parent_type=false;
					let new_parent_type=false;
					$('.editor-formatter > a.editor-header2-action').removeClass('positive');
					$('.editor-formatter > a.editor-header3-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive-alt');
					if('P'==parent_element_type){
						old_parent_type='p';
						new_parent_type='h3';

						$('.editor-formatter > a.editor-header3-action').addClass('positive');
					}
					else
					if('CITE'==parent_element_type){
						old_parent_type='cite';
						new_parent_type='h3';
						$('.editor-formatter > a.editor-header3-action').addClass('positive');
					}
					else
					if('BLOCKQUOTE'==parent_element_type){
						old_parent_type='blockquote';
						new_parent_type='h3';
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('H2'==parent_element_type){
						old_parent_type='h2';
						new_parent_type='h3';
						$('.editor-formatter > a.editor-header3-action').addClass('positive');
					}
					else
					if('H3'==parent_element_type){
						old_parent_type='h3';
						new_parent_type='p';
					}
					let html=parent_element.outerHTML;
					html=fast_str_replace('<'+old_parent_type+'>','',html);
					html=fast_str_replace('</'+old_parent_type+'>','',html);
					parent_element.outerHTML='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
					$('.editor-text')[0].focus();

					editor_change();

					let new_selection_temp=document.getElementById('new_selection_temp');
					let range=document.createRange();
					range.selectNodeContents(new_selection_temp);
					selection.removeAllRanges();
					selection.addRange(range);
					new_selection_temp.removeAttribute('id');
				}
			}
		}
	}
	if($(target).hasClass('editor-quote-action')){
		if(!$(target).hasClass('disabled')){
			e.preventDefault();
			let selection=document.getSelection();
			if(typeof selection !== "undefined"){
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					let parent_element=$(selection.focusNode.parentNode)[0];
					let parent_element_type=parent_element.nodeName;
					if('DIV'==parent_element_type){
						parent_element=$(selection.focusNode)[0];
						parent_element_type=parent_element.nodeName;
					}
					let old_parent_type=false;
					let new_parent_type=false;
					$('.editor-formatter > a.editor-header2-action').removeClass('positive');
					$('.editor-formatter > a.editor-header3-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive-alt');
					if('P'==parent_element_type){
						old_parent_type='p';
						new_parent_type='cite';

						$('.editor-formatter > a.editor-quote-action').addClass('positive');
					}
					else
					if('H2'==parent_element_type){
						old_parent_type='h2';
						new_parent_type='cite';

						$('.editor-formatter > a.editor-quote-action').addClass('positive');
					}
					else
					if('H3'==parent_element_type){
						old_parent_type='h3';
						new_parent_type='cite';

						$('.editor-formatter > a.editor-quote-action').addClass('positive');
					}
					else
					if('CITE'==parent_element_type){
						old_parent_type='cite';
						new_parent_type='blockquote';
						$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
					}
					else
					if('BLOCKQUOTE'==parent_element_type){
						old_parent_type='blockquote';
						new_parent_type='p';
					}
					let html=parent_element.outerHTML;
					html=fast_str_replace('<'+old_parent_type+'>','',html);
					html=fast_str_replace('</'+old_parent_type+'>','',html);
					parent_element.outerHTML='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
					$('.editor-text')[0].focus();

					editor_change();

					let new_selection_temp=document.getElementById('new_selection_temp');
					let range=document.createRange();
					range.selectNodeContents(new_selection_temp);
					selection.removeAllRanges();
					selection.addRange(range);
					new_selection_temp.removeAttribute('id');
				}
			}
		}
	}
	if($(target).hasClass('editor-code-action')){
		if(!$(target).hasClass('disabled')){
			e.preventDefault();
			let selection=document.getSelection();
			if(typeof selection !== "undefined"){
				let selection_html=get_selection_html();
				let selection_text=selection.toString();
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					if($(target).hasClass('positive')){
						$(target).removeClass('positive');
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('CODE'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
								selection_text=selection.toString();
							}
						}

						html='<b id="new_selection_temp">'+selection_text+'</b>';
						document.execCommand('insertHTML',false,html);

						let new_selection_temp=document.getElementById('new_selection_temp');
						let range=document.createRange();
						range.selectNodeContents(new_selection_temp);
						selection.removeAllRanges();
						selection.addRange(range);
						new_selection_temp.removeAttribute('id');
						console.log(typeof new_selection_temp,new_selection_temp.nodeType);

						document.execCommand('bold',false,false);
						editor_change();
					}
					else{
						$(target).addClass('positive');
						selection_insert_tag('code',selection_text);
						editor_change();
					}
				}
			}
		}
	}
	if($(target).hasClass('editor-link-action')){
		if(!$(target).hasClass('disabled')){
			e.preventDefault();
			if($(target).hasClass('positive')){
				$(target).removeClass('positive');
				let selection=document.getSelection();
				if(typeof selection !== "undefined"){
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let selection_text=selection.toString();
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('A'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
							document.execCommand('unlink',false,null);
						}
						else{
							document.execCommand('unlink',false,null);
						}
					}
				}
			}
			else{
				let url=prompt(ltmp_editor.editor_link_prompt,ltmp_editor.editor_link_placeholder_prompt);
				if(url && url!='' && url!=ltmp_editor.editor_link_placeholder_prompt){
					$(target).addClass('positive');
					document.execCommand('createlink',false,url);
				}
			}
		}
	}
	if($(target).hasClass('editor-image-action')){
		if(!$(target).hasClass('disabled')){
			if(!$(target).hasClass('positive')){
				e.preventDefault();
				let selection=document.getSelection();
				if(typeof selection !== "undefined"){
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let selection_text=selection.toString();
						let url=prompt(ltmp_editor.editor_image_prompt,ltmp_editor.editor_link_placeholder_prompt);
						if(url && url!='' && url!=ltmp_editor.editor_link_placeholder_prompt){
							let img_el=selection_insert_tag('img');
							img_el.setAttribute('src',url);
							img_el.setAttribute('alt',selection_text);
							editor_change();
						}
					}
				}
			}
		}
	}
	if($(target).hasClass('editor-attach-image-action')){
		if(!$(target).hasClass('disabled')){
			if(!$(target).hasClass('positive')){
				e.preventDefault();
				let selection=document.getSelection();
				if(typeof selection !== "undefined"){
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let selection_text=selection.toString();
						sia_upload_percent=0;
						sia_upload(/image.*/,function(result){
							if(typeof result == 'boolean'){
								if(result){
									$(target).addClass('positive');
								}
								else{
									add_notify(false,
										ltmp_arr.notify_arr.error,
										ltmp_arr.notify_arr.upload_incorrect_format
									);
									sia_upload_percent=0;
									$(target).removeClass('positive');
								}
							}
							else
							if(typeof result == 'string'){
								let link=sia_link(result);
								let img_el=selection_insert_tag('img');
								img_el.setAttribute('src',link);
								img_el.setAttribute('alt',selection_text);
								$(target).removeClass('positive');
								sia_upload_percent=0;
								editor_change();
							}
							else{
								if(typeof result == 'object'){
									if(typeof result.loaded !== 'undefined'){
										let percent = parseInt(result.loaded / result.total * 100);
										if(percent>(sia_upload_percent+10)){
											clearTimeout(sia_upload_percent_timer);
											sia_upload_percent_timer=setTimeout(function(){
												add_notify(false,
													ltmp_arr.notify_arr.upload,
													ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
												);
											},1000);
											sia_upload_percent=percent;
										}
									}
								}
							}
						});
					}
				}
			}
		}
	}
	if($(target).hasClass('editor-attach-action')){
		if(!$(target).hasClass('disabled')){
			if(!$(target).hasClass('positive')){
				e.preventDefault();
				let selection=document.getSelection();
				if(typeof selection !== "undefined"){
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let selection_text=selection.toString();
						sia_upload_percent=0;
						sia_upload(/.*/,function(result){
							if(typeof result == 'boolean'){
								if(result){
									$(target).addClass('positive');
								}
								else{
									add_notify(false,
										ltmp_arr.notify_arr.error,
										ltmp_arr.notify_arr.upload_incorrect_format
									);
									sia_upload_percent=0;
									$(target).removeClass('positive');
								}
							}
							else
							if(typeof result == 'string'){
								let text='sia://'+result;
								let link=sia_link(result);
								if(''==selection_text){
									selection_text=text;
								}
								let link_el=selection_insert_tag('a',text);
								$(link_el).attr('href',link);
								$(link_el).attr('target','_blank');
								$(target).removeClass('positive');
								sia_upload_percent=0;
								editor_change();
							}
							else{
								if(typeof result == 'object'){
									if(typeof result.loaded !== 'undefined'){
										let percent = parseInt(result.loaded / result.total * 100);
										if(percent>(sia_upload_percent+10)){
											clearTimeout(sia_upload_percent_timer);
											sia_upload_percent_timer=setTimeout(function(){
												add_notify(false,
													ltmp_arr.notify_arr.upload,
													ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
												);
											},1000);
											sia_upload_percent=percent;
										}
									}
								}
							}
						});
					}
				}
			}
		}
	}
	if($(target).hasClass('editor-bold-action')){
		console.log('BOLD');
		console.log('DISABLED',$(target).hasClass('disabled'));
		console.log('POSITIVE',$(target).hasClass('positive'));
		if(!$(target).hasClass('disabled')){
			if($(target).hasClass('positive')){
				$(target).removeClass('positive');
				let selection=document.getSelection();
				if(typeof selection !== "undefined"){
					let selection_text=selection.toString();
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('B'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
							if('STRONG'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
						}
					}
				}
				document.execCommand('bold',false,false);
				e.preventDefault();
			}
			else{
				$(target).addClass('positive');
				document.execCommand('bold',false,true);
				e.preventDefault();
			}
		}
	}
	if($(target).hasClass('editor-italic-action')){
		if(!$(target).hasClass('disabled')){
			if($(target).hasClass('positive')){
				$(target).removeClass('positive');
				let selection=document.getSelection();
				if(typeof selection !== "undefined"){
					let selection_text=selection.toString();
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('I'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
							if('EM'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
						}
					}
				}
				document.execCommand('italic',false,false);
				e.preventDefault();
			}
			else{
				$(target).addClass('positive');
				document.execCommand('italic',false,true);
				e.preventDefault();
			}
		}
	}
	if($(target).hasClass('editor-strikethrough-action')){
		if(!$(target).hasClass('disabled')){
			if($(target).hasClass('positive')){
				$(target).removeClass('positive');
				let selection=document.getSelection();
				if(typeof selection !== "undefined"){
					let selection_text=selection.toString();
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('STRIKE'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
						}
					}
				}
				document.execCommand('strikeThrough',false,false);
				e.preventDefault();
			}
			else{
				$(target).addClass('positive');
				document.execCommand('strikeThrough',false,true);
				e.preventDefault();
			}
		}
	}
}

function editor_bind(){
	$('.editor-text').on('input',editor_change);
	$('.editor-text').on('keyup',editor_change);
	$('.editor-text').on('paste',editor_change);

	document.execCommand('defaultParagraphSeparator',false,'p');
	document.addEventListener('selectionchange',editor_selection);
}

function editor_unbind(){
	$('.editor-text').off('input');
	$('.editor-text').off('keyup');
	$('.editor-text').off('paste');

	document.removeEventListener('selectionchange',editor_selection);
}

var editor_allowed_elements=['#text','H1','H2','H3','P','STRONG','B','EM','I','STRIKE','HR','BR','A','CODE','BLOCKQUOTE','CITE','IMG','UL','OL','LI'];
var editor_allowed_attributes=['href','src','target','width','alt'];
function editor_clear_elements(parent,level){
	let parent_element=$(parent)[0].nodeName;
	let incorrect=false;
	$(parent)[0].childNodes.forEach(function(el,i){
		if(!incorrect){
			let element=$(el)[0];
			if(-1==editor_allowed_elements.indexOf(element.nodeName)){
				if(0!=element.children.length){
					editor_clear_elements(element,1+level);
				}
				element.outerHTML=element.innerHTML;
				incorrect=true;
			}
			else{
				if('#text'==element.nodeName){
					if(0==level){
						var p_el=document.createElement("p");
						p_el.textContent=element.textContent;
						element.replaceWith(p_el);
					}
				}
				else{
					//console.log(typeof element.style,element.style);
					element.removeAttribute('style');
					element.removeAttribute('class');
					if(0!=element.dataset.length){
						for(let key in element.dataset){
							delete element.dataset[key];
						}
					}
					if(0!=element.attributes.length){
						let to_remove=[];
						for(let key in element.attributes){
							if(typeof element.attributes[key]['nodeName'] !== 'undefined'){
								if(-1==editor_allowed_attributes.indexOf(element.attributes[key]['nodeName'])){
									to_remove.push(element.attributes[key]['nodeName']);
								}
							}
						}
						for(let key in to_remove){
							element.removeAttribute(to_remove[key]);
						}
					}
					if(0!=element.children.length){
						editor_clear_elements(element,1+level);
					}
					if(0!=level){
						if('P'==element.nodeName){
							if('P'==parent_element){
								$(element)[0].outerHTML=$(element)[0].innerHTML;
							}
						}
					}
					if('LI'==element.nodeName){
						//need to test <br> tag for repeats (more than 1 is break \n\n markdown in lists)
						let check_br_breakup=$(element)[0].innerHTML;
						check_br_breakup=fast_str_replace('<br />','<br>',check_br_breakup);
						check_br_breakup=fast_str_replace('<br/>','<br>',check_br_breakup);
						//browser add <br> to the end in empty line
						//thats why need to calc one from end (simple remove 4 from length)
						if(-1!==check_br_breakup.indexOf('<br><br>')){
							if(check_br_breakup.indexOf('<br><br>')<check_br_breakup.length-8){//ignore end
								let find_repeat_position=check_br_breakup.indexOf('<br><br>');
								if(-1!==find_repeat_position){
									let first_part=check_br_breakup.substring(0,find_repeat_position);
									let second_part=check_br_breakup.substring(find_repeat_position+8);
									$(element)[0].innerHTML=first_part;
									$(element).after('<li>'+second_part+'</li>');
								}
								else{
									check_br_breakup=fast_str_replace('<br><br>','<br>',check_br_breakup);
									$(element)[0].innerHTML=check_br_breakup;
									$(element).after('<li></li>');
								}
								let new_li=$(element).next()[0];
								let selection=document.getSelection();
								let range=document.createRange();
								range.selectNodeContents(new_li);
								range.collapse(true);//caret to start of range
								selection.removeAllRanges();
								selection.addRange(range);
							}
						}
					}
				}
			}
		}
	});
	if(incorrect){
		editor_clear_elements(parent,level);
	}
	else{
		if(0==level){
			editor_selection();
		}
	}
}

function check_editor_placeholders(editor){
	let placeholders=$('.editor-placeholders');
	if(0!=editor.find('ul').length){//remove empty ul
		editor.find('ul').each(function(i,el){
			if(''==el.innerHTML){
				el.remove();
			}
		});
	}
	if(0!=editor.find('ol').length){//remove empty ol
		editor.find('ol').each(function(i,el){
			if(''==el.innerHTML){
				el.remove();
			}
		});
	}
	if(0!=editor.find('p').length){//remove empty ol
		editor.find('p').each(function(i,el){
			if(('* '==el.innerHTML)||('*&nbsp;'==el.innerHTML)){//auto create ul
				el.outerHTML='<ul><li id="new_selection_temp"></li></ul>';
				let selection=document.getSelection();
				let new_selection_temp=document.getElementById('new_selection_temp');
				let range=document.createRange();
				range.selectNodeContents(new_selection_temp);
				selection.removeAllRanges();
				selection.addRange(range);
				new_selection_temp.removeAttribute('id');
			}
			if(('1. '==el.innerHTML)||('1.&nbsp;'==el.innerHTML)){//auto create ol
				el.outerHTML='<ol><li id="new_selection_temp"></li></ol>';
				let selection=document.getSelection();
				let new_selection_temp=document.getElementById('new_selection_temp');
				let range=document.createRange();
				range.selectNodeContents(new_selection_temp);
				selection.removeAllRanges();
				selection.addRange(range);
				new_selection_temp.removeAttribute('id');
			}
		});
	}

	if(0==editor.find('h1').length){
		//console.log("editor.find('h1').length",editor.find('h1').length);
		editor.prepend('<h1><br></h1>');
		placeholders.find('h1').removeClass('hidden');
	}
	else{
		if(1!=editor.find('h1').length){
			editor.find('h1').each(function(i,el){
				if(0==i){
					el.innerHTML=el.textContent;
				}
				else{
					el.remove();
				}
			});
		}
		if(''!=editor.find('h1')[0].textContent){
			placeholders.find('h1').addClass('hidden');
		}
		else{
			editor.find('h1').html('<br>');
			placeholders.find('h1').removeClass('hidden');
		}
	}
	placeholders.find('p').removeClass('hidden');

	let find_content=false;
	if(0!=editor.find('p').length){
		if(1==editor.find('p').length){
			if(''==editor.find('p')[0].textContent){
				find_content=false;
			}
			else{
				find_content=true;
			}
		}
		else{
			find_content=true;
		}
	}
	if(0!=editor.find('blockquote').length){
		find_content=true;
	}
	if(0!=editor.find('cite').length){
		find_content=true;
	}
	if(0!=editor.find('img').length){
		find_content=true;
	}
	if(0!=editor.find('h2').length){
		find_content=true;
	}
	if(0!=editor.find('h3').length){
		find_content=true;
	}
	if(0!=editor.find('li').length){
		find_content=true;
	}
	if(find_content){
		placeholders.find('p').addClass('hidden');
	}
	else{
		if(0==editor.find('p').length){
			editor.append('<p><br></p>');
		}
		if(0!=editor.find('hr').length){
			placeholders.find('p').addClass('hidden');
		}
		else{
			placeholders.find('p').removeClass('hidden');
		}
	}
}

function editor_change(e){
	e=typeof e !== 'undefined'?e:false;
	let editor=false;
	if(false===e){
		editor=$('.editor-text');
	}
	//console.log('editor_change',typeof e,e);
	if('input'==e.type){
		if('deleteContentBackward'==e.inputType){
			let selection=document.getSelection();
			let parent_element_html=$(selection.focusNode.parentNode)[0].innerHTML;
			let parent_element_type=$(selection.focusNode.parentNode)[0].nodeName;
			if(('OL'==parent_element_type)||('UL'==parent_element_type)){
				if('<li><br></li>'==parent_element_html){
					$(selection.focusNode.parentNode)[0].outerHTML='';
					e.preventDefault();
					e.returnValue=false;
					e.cancelBubble=true;
					return false;
				}
			}
		}
	}
	else
	if('keyup'==e.type){
		if(false!==e){
			editor=$(e.target);
		}
		check_editor_placeholders(editor);

		setTimeout(function(){
			editor_clear_elements(editor,0);
		},10);

		clearTimeout(editor_save_draft_timer);
		editor_save_draft_timer=setTimeout(function(){
			editor_save_draft();
		},1000);
	}
	else{
		check_editor_placeholders(editor);
	}
}

function editor_selection(e){
	let selection=document.getSelection();
	if(typeof selection !== "undefined"){
		if(typeof $(selection.focusNode).closest('.article-editor')[0] !== 'undefined'){
			//selection into editor
		}
		else{
			//outside
			$('.editor-formatter > a').addClass('disabled');
			$('.editor-formatter > a').removeClass('positive');
			$('.editor-formatter > a').removeClass('positive-alt');
		}
		if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
			$('.editor-formatter > a').addClass('disabled');
			$('.editor-formatter > a').removeClass('positive');
			$('.editor-formatter > a').removeClass('positive-alt');

			$('.editor-formatter > a.editor-reset-action').removeClass('disabled');

			let element_type=$(selection.focusNode)[0].nodeName;
			let parent_element_html=$(selection.focusNode.parentNode)[0].innerHTML;
			let parent_element_type=$(selection.focusNode.parentNode)[0].nodeName;
			let selection_text=selection.toString();
			let selection_html=get_selection_html(true);
			let tags=get_selection_tags(true);
			if('DIV'==element_type){
				if('DIV'==parent_element_type){
					return;
				}
			}
			//console.log(e,selection,selection_text,selection_html);
			//console.log(parent_element_type,' > ',element_type);
			if(''!=selection_text){//text part
				if('H1'==parent_element_type){
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
				}
				if('A'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').addClass('positive');
				}
				if('STRIKE'==parent_element_type){//#text into strike element
					if('H1'!=$(selection.focusNode.parentNode.parentNode)[0].nodeName){
						$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
						$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
						$('.editor-formatter > a.editor-code-action').removeClass('disabled');
					}
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');

					$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
				}
				if('STRONG'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if('B'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if('EM'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if('I'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if('CODE'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-code-action').addClass('positive');
				}
				if('DIV'==parent_element_type){//empty P
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					if('H1'!=element_type){
						$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
						$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
						$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					}
					if('H2'==element_type){
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					if('H3'==element_type){
						$('.editor-formatter > a.editor-header3-action').addClass('positive');
					}
					if('CITE'==element_type){
						$('.editor-formatter > a.editor-quote-action').addClass('positive');
					}
					if('BLOCKQUOTE'==element_type){
						$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
					}
				}
				if('LI'==parent_element_type){
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					let subparent_element_type=$(selection.focusNode.parentNode)[0].parentNode.nodeName;
					if('UL'==subparent_element_type){
						$('.editor-formatter > a.editor-ul-action').removeClass('disabled');
					}
					if('OL'==subparent_element_type){
						$('.editor-formatter > a.editor-ol-action').removeClass('disabled');
					}
				}
				if('P'==parent_element_type){
					$('.editor-formatter > a.editor-attach-image-action').removeClass('disabled');
					$('.editor-formatter > a.editor-image-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');

					$('.editor-formatter > a.editor-ul-action').removeClass('disabled');
					$('.editor-formatter > a.editor-ol-action').removeClass('disabled');

					if('A'==element_type){
						$('.editor-formatter > a.editor-link-action').removeClass('disabled');
						$('.editor-formatter > a.editor-link-action').addClass('positive');
					}
					if('STRONG'==element_type){
						$('.editor-formatter > a.editor-bold-action').addClass('positive');
					}
					if('B'==element_type){
						$('.editor-formatter > a.editor-bold-action').addClass('positive');
					}
					if('EM'==element_type){
						$('.editor-formatter > a.editor-italic-action').addClass('positive');
					}
					if('I'==element_type){
						$('.editor-formatter > a.editor-italic-action').addClass('positive');
					}
					if('STRIKE'==element_type){
						$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
					}
					if('CODE'==element_type){
						$('.editor-formatter > a.editor-code-action').addClass('positive');
					}
				}
				if('CITE'==parent_element_type){
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').addClass('positive');
				}
				if('BLOCKQUOTE'==parent_element_type){
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
				}
				if('H2'==parent_element_type){
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');

					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').addClass('positive');
				}
				if('H3'==parent_element_type){
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');

					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').addClass('positive');
				}

				if(-1!=tags.indexOf('A')){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').addClass('positive');
				}
				if(-1!=tags.indexOf('STRIKE')){
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
				}
				if(-1!=tags.indexOf('STRONG')){
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if(-1!=tags.indexOf('B')){
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if(-1!=tags.indexOf('EM')){
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if(-1!=tags.indexOf('I')){
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if(-1!=tags.indexOf('CODE')){
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').addClass('positive');
				}
				/*
				if('STRIKE'==element_type){//selected strike element
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
				}
				else{
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('positive');
				}
				*/
			}
			else{//paragraph
				if('DIV'==parent_element_type){
					if('H1'!=element_type){
						$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
						$('.editor-formatter > a.editor-attach-image-action').removeClass('disabled');
						$('.editor-formatter > a.editor-image-action').removeClass('disabled');
						$('.editor-formatter > a.editor-link-action').removeClass('disabled');

						$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
						$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
						$('.editor-formatter > a.editor-quote-action').removeClass('disabled');

						$('.editor-formatter > a.editor-separator-action').removeClass('disabled');
						if('CITE'==element_type){
							$('.editor-formatter > a.editor-quote-action').addClass('positive');
						}
						if('BLOCKQUOTE'==element_type){
							$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
						}
						if('H2'==element_type){
							$('.editor-formatter > a.editor-header2-action').addClass('positive');
						}
						if('H3'==element_type){
							$('.editor-formatter > a.editor-header3-action').addClass('positive');
						}
					}
				}
				if('LI'==parent_element_type){
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					let subparent_element_type=$(selection.focusNode.parentNode)[0].parentNode.nodeName;
					if('UL'==subparent_element_type){
						$('.editor-formatter > a.editor-ul-action').removeClass('disabled');
					}
					if('OL'==subparent_element_type){
						$('.editor-formatter > a.editor-ol-action').removeClass('disabled');
					}
				}
				if('UL'==parent_element_type){
					$('.editor-formatter > a.editor-ul-action').removeClass('disabled');
				}
				if('OL'==parent_element_type){
					$('.editor-formatter > a.editor-ol-action').removeClass('disabled');
				}
				if('P'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-attach-image-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-image-action').removeClass('disabled');

					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');

					$('.editor-formatter > a.editor-ul-action').removeClass('disabled');
					$('.editor-formatter > a.editor-ol-action').removeClass('disabled');

					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');
				}
				if('A'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').addClass('positive');
				}
				if('STRIKE'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
				}
				if('B'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if('STRONG'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if('I'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if('EM'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if('CODE'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').addClass('positive');
				}
				if('CITE'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').addClass('positive');
				}
				if('BLOCKQUOTE'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
				}
				if('H2'==parent_element_type){
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').addClass('positive');
				}
				if('H3'==parent_element_type){
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').addClass('positive');
				}
			}
			//$('.editor-formatter > a').removeClass('disabled');
			//#text P
			/*
	var person = prompt("Please enter your name", "Harry Potter");
	if(person != null){
		document.getElementById("demo").innerHTML =
		"Hello " + person + "! How are you today?";
	}
			*/
		}
	}
}