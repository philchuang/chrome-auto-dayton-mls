$(document).ready(function(){
	console.log("rapmls.com.js");
	$("input[type='checkbox'][name='Prop_Type_RESI']").trigger('click');
	//SetAdditionalCriteraButton();
	$("input[type='checkbox'][name='Prop_Subtype_RESI_0001']").trigger('click');
	$("input[type='text'][name='Price_From_M1']").val("250");
	$("input[type='text'][name='Price_Thru_M1']").val("350");
	$("input[type='text'][name='Zip_Fill_In']").val("45434,45440,45430,45305");
	//cpSearch.doSearch('SubmitBtn1');
	$("input[type='button'][id='SubmitBtn0']").trigger('click');
});