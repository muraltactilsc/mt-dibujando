


CREATE VIEW [dbo].[OSCDocuments] AS
SELECT OPF.OSCProfileHasFileId as Id, OP.Name as OSC, FT.name as Documento, FC.Name as Categoría, FS.Description as Estatus
FROM [dbo].[OSCProfileHasFile] as OPF 
INNER JOIN OSCProfile as OP 
ON OPF.OSCProfileId = OP.OSCProfileId
INNER JOIN Status as FS 
ON OPF.FileStatusId = FS.StatusId
INNER JOIN FileType as FT 
ON OPF.FileTypeId = FT.FileTypeId
INNER JOIN FileCategory as FC 
ON FT.FileCategoryId = FC.FileCategoryId
WHERE OPF.[OSCProfileId] IS NOT NULL and OPF.StatusId = 1;
