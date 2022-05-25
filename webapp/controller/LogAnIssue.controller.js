sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/library"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, MessageToast, MessageBox, UploadCollectionParameter, Filter, FilterOperator, coreLibrary) {
        "use strict";

        var oModel, controller;
        return Controller.extend("aj.loganissue.controller.LogAnIssue", {
            onInit: function () {
                var oData = {
                    "newIssue": {
                        "CompanyCode": "",
                        "ServiceTeamCode": "",
                        "TypeOfIssueCode": "",
                        "Subject": "",
                        "DetailIssue": "",
                        "IssueToEquipments": []
                    }
                };

                oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "MainModel");
                // Controller.validation();
            },

            onValueHelpRequested: function () {
                if (!this._oValueHelpDialog) {
                    this._oValueHelpDialog = sap.ui.xmlfragment(
                        "aj.loganissue.Fragments.Valuehelp",
                        this
                    );
                    this.getView().addDependent(this._oValueHelpDialog);
                }
                this._oValueHelpDialog.open();

            },

            onConfirm: function (evt) {
                var aSelectedItems = evt.getParameter("selectedItems");

                if (aSelectedItems && aSelectedItems.length > 0) {
                    var aEquit = this.getView().getModel("MainModel").getProperty("/newIssue/IssueToEquipments");
                    if (!aEquit) {
                        aEquit = [];
                    }
                    aSelectedItems.forEach(function (oItem) {
                        aEquit.push({
                            "EquipmentId": oItem.getTitle(),
                            "EquipmentName": oItem.getDescription()

                        });

                    });

                    this.getView().getModel("MainModel").setProperty("/newIssue/IssueToEquipments", aEquit);

                }
                oModel.updateBindings(false);
            },

            onSearch: function (evt) {
                var sValue = evt.getParameters().value;
                var aFilter = [];
                if (sValue !== "") {
                    var oFilter = new Filter("EquipmentId", FilterOperator.Contains, sValue);
                    aFilter.push(oFilter);
                }
                evt.getSource().getBinding("items").filter(aFilter);
            },

            validation: function (oNewIssue) {
                var flag = true;

                if (oNewIssue.CompanyCode == "") {
                    this.getView().byId("CID").setValueState("Error");
                    flag = false;
                } else {
                    this.getView().byId("CID").setValueState("None");
                    // flag = true;
                }

                if (oNewIssue.ServiceTeamCode == "") {
                    this.getView().byId("serviceId").setValueState("Error");
                    flag = false;
                } else {
                    this.getView().byId("serviceId").setValueState("None");
                    // flag = true;
                }

                if (oNewIssue.TypeOfIssueCode == "") {
                    this.getView().byId("issueId").setValueState("Error");
                    flag = false;
                } else {
                    this.getView().byId("issueId").setValueState("None");
                    // flag = true;
                }

                if (oNewIssue.Subject == "") {
                    this.getView().byId("subjectId").setValueState("Error");
                    flag = false;
                } else {
                    this.getView().byId("subjectId").setValueState("None");
                    // flag = true;
                }

                if (oNewIssue.DetailIssue == "") {
                    this.getView().byId("detailsId").setValueState("Error");
                    flag = false;
                } else {
                    this.getView().byId("detailsId").setValueState("None");
                    // flag = true;
                }

                return flag;
            },

            onSubmit: function (evt) {
                var oMainModel = this.getView().getModel("MainModel");
                var oNewIssue = oMainModel.getProperty("/newIssue");
                // var flag = true;

                var flag = this.validation(oNewIssue);

                var currentdate = new Date().toISOString().split(".")[0];
                if (oNewIssue.IssueToEquipments && oNewIssue.IssueToEquipments.length > 0) {
                    var aEquiArray = oNewIssue.IssueToEquipments.map((item) => {
                        return {
                            "EquipmentId": item.EquipmentId,
                        }
                    });
                    oNewIssue.IssueToEquipments = aEquiArray;
                } else { delete oNewIssue.IssueToEquipments; }

                if (flag) {
                    var odataModel = this.getView().getModel();
                    odataModel.create("/LogIssues", oNewIssue, {
                        success: function (oData) {
                            MessageBox.success("Successfully Created");
                            oMainModel.setProperty("/newIssue", {
                                "CompanyCode": "",
                                "ServiceTeamCode": "",
                                "TypeOfIssueCode": "",
                                "Subject": "",
                                "DetailIssue": "",
                                "IssueToEquipments": []
                            });
                        },
                        error: function (oError) {
                            MessageBox.error("Error");
                        }
                    }
                    );
                }
                else { MessageToast.show(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("errmsg")); }

            },

        });
    });
