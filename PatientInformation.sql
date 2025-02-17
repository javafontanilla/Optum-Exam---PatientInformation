USE [PatientInformation]
GO
/****** Object:  UserDefinedFunction [dbo].[ConvertUTCToPH]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[ConvertUTCToPH](@date datetime)
returns datetime
as
begin
declare @currentdate as datetime
select @currentdate =  @date AT TIME ZONE 'UTC' AT TIME ZONE 'Singapore Standard Time'

return @currentdate

end
GO
/****** Object:  UserDefinedFunction [dbo].[Decode_Base64]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[Decode_Base64] (
	@value NVARCHAR(MAX)
	)
RETURNS VARCHAR(max)
AS
BEGIN 
	DECLARE @DecodedValue VARCHAR(MAX);
	DECLARE @TempTable TABLE (
		colData NVARCHAR(MAX)
	);
	
	INSERT INTO @TempTable VALUES(@value)	
	
	SELECT 
			@DecodedValue = CONVERT
			(
					VARCHAR(MAX), 
					CAST('' AS XML).value('xs:base64Binary(sql:column("colData"))', 'VARBINARY(MAX)')
			)
	FROM @TempTable;
			
	RETURN @DecodedValue;

END
GO
/****** Object:  UserDefinedFunction [dbo].[Encode_Base64]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[Encode_Base64]
(
    @value varchar(max)
)
RETURNS varchar(max)
AS
BEGIN
    DECLARE @source varbinary(max) = convert(varbinary(max), @value)
    RETURN cast('' as xml).value('xs:base64Binary(sql:variable("@source"))', 'varchar(max)')
END
GO
/****** Object:  Table [dbo].[UserAccount]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserAccount](
	[UserID] [nvarchar](50) NOT NULL,
	[UserName] [nvarchar](50) NOT NULL,
	[Password] [nvarchar](25) NOT NULL,
	[UserType] [nvarchar](25) NOT NULL,
 CONSTRAINT [PK__UserAcco__1788CCAC43FAF135] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserModuleAccess]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserModuleAccess](
	[UserAccessID] [nvarchar](50) NULL,
	[UserId] [nvarchar](50) NULL,
	[ModuleAccess] [nvarchar](100) NULL
) ON [PRIMARY]
GO
INSERT [dbo].[UserAccount] ([UserID], [UserName], [Password], [UserType]) VALUES (N'06980601-4302-4A42-B07D-C4258A5FB125', N'jcfontanilla', N'YXc=', N'ADMIN')
GO
INSERT [dbo].[UserAccount] ([UserID], [UserName], [Password], [UserType]) VALUES (N'0FB0018A-779F-4F40-BA8D-23E1CC3B6833', N'ADMIN', N'QUJDMTIz', N'ADMIN')
GO
INSERT [dbo].[UserAccount] ([UserID], [UserName], [Password], [UserType]) VALUES (N'4A1A201C-4B43-467D-8B80-85790DCA4EF0', N'ADMIN1', N'QUJDMTIz', N'USER')
GO
INSERT [dbo].[UserAccount] ([UserID], [UserName], [Password], [UserType]) VALUES (N'51795595-E43F-43D5-8C18-D8148C128801', N'testing', N'MTIz', N'ADMIN')
GO
/****** Object:  StoredProcedure [dbo].[SPCheckUsernameAndPassword]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SPCheckUsernameAndPassword]
 @Username NVARCHAR(50),
 @Password NVARCHAR(50)
 AS
BEGIN
	--IF EXISTS(SELECT 1 FROM UserAccount WHERE Username = @Username AND @Password = dbo.Decode_Base64(Password))
	--BEGIN
	--	SELECT UserId FROM UserAccount WHERE Username = @Username AND @Password = dbo.Decode_Base64(Password)
	--END
	
	 SELECT UserId FROM UserAccount;
END
GO
/****** Object:  StoredProcedure [dbo].[SPDeleteUser]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SPDeleteUser]
	@UserID NVARCHAR(50)
AS
BEGIN
	DELETE FROM [UserAccount] WHERE UserID = @UserID;
END
GO
/****** Object:  StoredProcedure [dbo].[SPGetAllUserAccount]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SPGetAllUserAccount]
@pageIndex int,
@pageSize int,
@totalCount int OUTPUT
AS
BEGIN
	SELECT @totalCount = Count(1) FROM UserAccount;

	SELECT * FROM UserAccount 
	ORDER BY UserName
	OFFSET (@pageIndex -1) * @pageSize ROWS
	FETCH NEXT @pageSize ROWS ONLY;
END
GO
/****** Object:  StoredProcedure [dbo].[SPGetUserAccount]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SPGetUserAccount]
	@UserID NVARCHAR(50)
AS
BEGIN
	SELECT a.UserID, a.UserName, dbo.Decode_Base64(a.Password) as "Password", a.UserType, 
		(
		SELECT * 
		FROM UserModuleAccess 
		WHERE UserId = @UserId
		FOR JSON PATH
		) AS modules
	FROM UserAccount a
	WHERE UserId = @UserId
	FOR JSON PATH;
END
GO
/****** Object:  StoredProcedure [dbo].[SPInsertUserAccount]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SPInsertUserAccount]
	@Username NVARCHAR(50),
	@Password NVARCHAR(50),
	@UserType NVARCHAR(50)
AS
BEGIN
	IF EXISTS(SELECT 1 FROM UserAccount WHERE UPPER(Username) = UPPER(@Username))
	BEGIN
		THROW 50001, 'User already exists.', 1;
	END
	ELSE
	BEGIN
		INSERT INTO UserAccount VALUES(NEWID(), @Username, dbo.Encode_Base64(@Password), @Usertype);
		
		SELECT UserID FROM UserAccount WHERE Username = @Username;
	END
END
GO
/****** Object:  StoredProcedure [dbo].[SPUpdateUserAccount]    Script Date: 02/17/2025 5:56:53 pm ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[SPUpdateUserAccount]
	@UserID NVARCHAR(50),
	@NewPassword NVARCHAR(50),
	@UserType NVARCHAR(50)
AS
BEGIN
	IF NOT EXISTS(SELECT 1 FROM UserAccount WHERE UserId = @UserId)
	BEGIN
		THROW 50001, 'User does not ex	ists', 1;
	END
	
	UPDATE UserAccount 
	SET Password = dbo.Encode_Base64(@NewPassword),
	UserType = @UserType
	WHERE UserId = @UserId;
END
GO
