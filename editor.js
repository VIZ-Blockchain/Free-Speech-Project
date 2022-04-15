var editor_version = 1;

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