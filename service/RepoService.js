sap.ui.define([
	"./HTTPService"
], function (HTTPService) {
	"use strict";

	var RepoService = HTTPService.extend("stipAdmin.stipAdmin.service.RepoService", {
		constructor: function () {},
		uploadFile: function (file,subpath) {
			var form = new FormData();
			form.append("datafile", file);
			form.append("cmisaction", "createDocument");
			form.append("propertyId[0]", "cmis:objectTypeId");
			form.append("propertyValue[0]", "cmis:document");
			form.append("propertyId[1]", "cmis:name");
			form.append("propertyValue[1]", file.name);

			return this.getRepoId().then(function (ReposId) {
			return this.http("/DMS/browser/"+ReposId+"/root/STIP/"+subpath).post(false, form);
			}.bind(this));
		},
		deleteFile: function (name,subpath) {
			var form = new FormData();
			form.append("cmisaction", "delete");

			return this.getRepoId().then(function (ReposId) {
				return this.http("/DMS/browser/"+ReposId+"/root/STIP/"+subpath+"/" + name).post(false, form);
			}.bind(this));
		},
		getFiles: function (name,subpath) {
			
			return this.getRepoId().then(function (ReposId) {
				return this.http("/DMS/browser/" + ReposId + "/root/STIP/"+subpath+"/" + name).get();
			}.bind(this));
		},
		getRepoId: function () {
			
			if (this.RepoId) {
				return Promise.resolve(this.RepoId);
			}
			return this.getRepoInfo().then(function (info) {
				for (var field in info) {
					this.ReposId = info[field].repositoryId;
					break;
				}
				return this.ReposId;
			}.bind(this));
		},
		getRepoInfo: function () {
			return this.http("/DMS/browser").get();
		}
	});
	return new RepoService();
});