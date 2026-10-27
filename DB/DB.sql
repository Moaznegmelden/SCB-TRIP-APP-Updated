USE [master]
GO
/****** Object:  Database [trips]    Script Date: 8/30/2026 2:16:20 PM ******/
CREATE DATABASE [trips]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'trips', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS02\MSSQL\DATA\trips.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'trips_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.SQLEXPRESS02\MSSQL\DATA\trips_log.ldf' , SIZE = 73728KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [trips] SET COMPATIBILITY_LEVEL = 170
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [trips].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [trips] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [trips] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [trips] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [trips] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [trips] SET ARITHABORT OFF 
GO
ALTER DATABASE [trips] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [trips] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [trips] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [trips] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [trips] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [trips] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [trips] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [trips] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [trips] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [trips] SET  DISABLE_BROKER 
GO
ALTER DATABASE [trips] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [trips] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [trips] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [trips] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [trips] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [trips] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [trips] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [trips] SET RECOVERY FULL 
GO
ALTER DATABASE [trips] SET  MULTI_USER 
GO
ALTER DATABASE [trips] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [trips] SET DB_CHAINING OFF 
GO
ALTER DATABASE [trips] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [trips] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [trips] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [trips] SET OPTIMIZED_LOCKING = OFF 
GO
ALTER DATABASE [trips] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [trips] SET QUERY_STORE = ON
GO
ALTER DATABASE [trips] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [trips]
GO
/****** Object:  User [trips_user]    Script Date: 8/30/2026 2:16:20 PM ******/
CREATE USER [trips_user] FOR LOGIN [trips_user] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [trips_user]
GO
/****** Object:  Table [dbo].[Answers]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Answers](
	[Answer_id] [int] NOT NULL,
	[Trip_id] [int] NOT NULL,
	[Answer] [nvarchar](max) NOT NULL,
 CONSTRAINT [PK_Answers] PRIMARY KEY CLUSTERED 
(
	[Answer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Application_Participants]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Application_Participants](
	[participant_id] [int] IDENTITY(1,1) NOT NULL,
	[application_id] [int] NOT NULL,
	[full_name] [varchar](150) NOT NULL,
	[relationship] [varchar](30) NOT NULL,
	[date_of_birth] [date] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[participant_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Applications]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Applications](
	[application_id] [int] IDENTITY(1,1) NOT NULL,
	[employee_id] [int] NOT NULL,
	[Status_id] [int] NOT NULL,
	[transport_type] [varchar](20) NOT NULL,
	[pickup_point] [varchar](100) NOT NULL,
	[trip_id] [int] NOT NULL,
	[created_at] [datetime] NOT NULL,
	[rooms_requested] [int] NOT NULL,
	[total_price] [decimal](18, 0) NOT NULL,
	[batch_id] [int] NOT NULL,
	[selected_at] [datetime] NULL,
	[selection_method] [varchar](255) NULL,
 CONSTRAINT [PK__Applicat__3BCBDCF2F6CA4F47] PRIMARY KEY CLUSTERED 
(
	[application_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Approval_History]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Approval_History](
	[history_id] [int] IDENTITY(1,1) NOT NULL,
	[application_id] [int] NOT NULL,
	[action_by] [int] NOT NULL,
	[role_at_action] [varchar](50) NOT NULL,
	[action] [varchar](30) NOT NULL,
	[comments] [varchar](500) NULL,
	[action_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[history_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Batches]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Batches](
	[Batch_id] [int] IDENTITY(1,1) NOT NULL,
	[trip_id] [int] NOT NULL,
	[start_date] [datetime] NOT NULL,
	[end_date] [datetime] NOT NULL,
	[number_of_rooms] [int] NOT NULL,
	[is_active] [bit] NOT NULL,
	[created_at] [datetime] NOT NULL,
	[created_by] [int] NOT NULL,
 CONSTRAINT [PK_Batches] PRIMARY KEY CLUSTERED 
(
	[Batch_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Departments]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Departments](
	[department_id] [int] IDENTITY(1,1) NOT NULL,
	[department_name] [varchar](100) NOT NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[department_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Employees]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Employees](
	[employee_id] [int] IDENTITY(1001,1) NOT NULL,
	[employee_number] [varchar](255) NULL,
	[full_name] [varchar](255) NULL,
	[email] [varchar](255) NULL,
	[department_id] [int] NULL,
	[manager_id] [int] NULL,
	[role_id] [int] NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime] NULL,
	[created_by] [int] NULL,
	[modify_at] [datetime] NULL,
	[modify_by] [int] NULL,
	[password] [nvarchar](255) NULL,
 CONSTRAINT [PK__Users__C52E0BA84585BD8B] PRIMARY KEY CLUSTERED 
(
	[employee_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Fields]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Fields](
	[FieldID] [int] IDENTITY(1,1) NOT NULL,
	[FieldText] [nvarchar](255) NOT NULL,
	[FieldType] [nvarchar](255) NOT NULL,
	[TypeID] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[FieldID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FieldType]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FieldType](
	[TypeID] [int] IDENTITY(1,1) NOT NULL,
	[TypeName] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Roles]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[role_id] [int] IDENTITY(1,1) NOT NULL,
	[role_name] [varchar](50) NOT NULL,
	[is_active] [bit] NOT NULL,
 CONSTRAINT [PK__Roles__760965CC87B9FBAB] PRIMARY KEY CLUSTERED 
(
	[role_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[selection_requests]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[selection_requests](
	[selection_request_id] [int] IDENTITY(1,1) NOT NULL,
	[trip_id] [int] NOT NULL,
	[batch_id] [int] NOT NULL,
	[requested_by] [int] NOT NULL,
	[method] [varchar](20) NOT NULL,
	[status] [varchar](20) NOT NULL,
	[rejection_reason] [varchar](1000) NULL,
	[reviewed_by] [int] NULL,
	[requested_at] [datetime2](7) NOT NULL,
	[reviewed_at] [datetime2](7) NULL,
 CONSTRAINT [PK_selection_requests] PRIMARY KEY CLUSTERED 
(
	[selection_request_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Status]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Status](
	[Status_id] [int] NOT NULL,
	[StatusName] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_Status] PRIMARY KEY CLUSTERED 
(
	[Status_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Trips]    Script Date: 8/30/2026 2:16:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Trips](
	[trip_id] [int] IDENTITY(1,1) NOT NULL,
	[title] [varchar](200) NOT NULL,
	[destination] [varchar](100) NOT NULL,
	[status_id] [int] NOT NULL,
	[created_by] [int] NOT NULL,
	[created_at] [datetime] NOT NULL,
	[is_active] [bit] NULL,
	[registration_open] [datetime] NOT NULL,
	[registration_close] [datetime] NOT NULL,
	[duration_days] [int] NOT NULL,
	[allocationMethod] [varchar](50) NULL,
	[confirmedQuota] [int] NULL,
	[waitlistQuota] [int] NULL,
	[announcementMessage] [varchar](500) NULL,
 CONSTRAINT [PK__Trips__302A5D9E2AF02C2A] PRIMARY KEY CLUSTERED 
(
	[trip_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Application_Participants] ON 
GO
INSERT [dbo].[Application_Participants] ([participant_id], [application_id], [full_name], [relationship], [date_of_birth]) VALUES (1, 3, N'string', N'string', CAST(N'2026-08-11' AS Date))
GO
SET IDENTITY_INSERT [dbo].[Application_Participants] OFF
GO
SET IDENTITY_INSERT [dbo].[Applications] ON 
GO
INSERT [dbo].[Applications] ([application_id], [employee_id], [Status_id], [transport_type], [pickup_point], [trip_id], [created_at], [rooms_requested], [total_price], [batch_id], [selected_at], [selection_method]) VALUES (3, 1015, 12, N'TRIP_BUS', N'string', 7, CAST(N'2026-08-11T16:02:23.467' AS DateTime), 0, CAST(0 AS Decimal(18, 0)), 2, NULL, N'FIFO')
GO
INSERT [dbo].[Applications] ([application_id], [employee_id], [Status_id], [transport_type], [pickup_point], [trip_id], [created_at], [rooms_requested], [total_price], [batch_id], [selected_at], [selection_method]) VALUES (15, 1015, 8, N'PRIVATE_CAR', N'Cairo', 2, CAST(N'2026-08-17T21:59:40.960' AS DateTime), 1, CAST(2800 AS Decimal(18, 0)), 1, NULL, NULL)
GO
INSERT [dbo].[Applications] ([application_id], [employee_id], [Status_id], [transport_type], [pickup_point], [trip_id], [created_at], [rooms_requested], [total_price], [batch_id], [selected_at], [selection_method]) VALUES (16, 1018, 7, N'PRIVATE_CAR', N'Cairo', 2, CAST(N'2026-08-23T16:35:39.050' AS DateTime), 1, CAST(2800 AS Decimal(18, 0)), 1, NULL, NULL)
GO
INSERT [dbo].[Applications] ([application_id], [employee_id], [Status_id], [transport_type], [pickup_point], [trip_id], [created_at], [rooms_requested], [total_price], [batch_id], [selected_at], [selection_method]) VALUES (17, 1019, 7, N'PRIVATE_CAR', N'Cairo', 2, CAST(N'2026-08-24T10:32:47.633' AS DateTime), 1, CAST(2800 AS Decimal(18, 0)), 1, NULL, NULL)
GO
INSERT [dbo].[Applications] ([application_id], [employee_id], [Status_id], [transport_type], [pickup_point], [trip_id], [created_at], [rooms_requested], [total_price], [batch_id], [selected_at], [selection_method]) VALUES (18, 1015, 13, N'PRIVATE_CAR', N'Cairo', 10, CAST(N'2026-08-25T14:22:00.980' AS DateTime), 1, CAST(2800 AS Decimal(18, 0)), 6, CAST(N'2026-08-26T11:31:05.323' AS DateTime), N'RANDOM')
GO
SET IDENTITY_INSERT [dbo].[Applications] OFF
GO
SET IDENTITY_INSERT [dbo].[Approval_History] ON 
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (1, 3, 1015, N'EMPLOYEE', N'APPLIED', N'Employee submitted application', CAST(N'2026-08-11T16:02:23.483' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (2, 3, 1017, N'LINE_MANAGER', N'APPROVED', N'string', CAST(N'2026-08-12T00:15:27.550' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (3, 3, 1017, N'HR_MANAGER', N'SELECTION_STARTED', N'Selection method: FIFO', CAST(N'2026-08-12T00:22:34.013' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (4, 3, 1017, N'HR_MANAGER', N'SELECTION_STARTED', N'Selection method: FIFO', CAST(N'2026-08-12T00:28:12.243' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (5, 3, 1017, N'LINE_MANAGER', N'REJECTED', N'Testing application rejection', CAST(N'2026-08-12T01:28:04.920' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (6, 15, 1015, N'EMPLOYEE', N'APPLIED', N'Employee submitted application', CAST(N'2026-08-17T21:59:40.997' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (7, 16, 1018, N'EMPLOYEE', N'APPLIED', N'Employee submitted application', CAST(N'2026-08-23T16:35:39.067' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (8, 17, 1019, N'EMPLOYEE', N'APPLIED', N'Employee submitted application', CAST(N'2026-08-24T10:32:47.747' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (9, 15, 1019, N'LINE_MANAGER', N'APPROVED', NULL, CAST(N'2026-08-25T10:48:24.810' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (10, 18, 1015, N'EMPLOYEE', N'APPLIED', N'Employee submitted application', CAST(N'2026-08-25T14:22:00.987' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (11, 18, 1019, N'LINE_MANAGER', N'APPROVED', NULL, CAST(N'2026-08-25T14:22:22.440' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (21, 18, 1018, N'HR_ADMIN', N'SELECTION_STARTED', N'Selection method: RANDOM', CAST(N'2026-08-26T11:31:05.307' AS DateTime))
GO
INSERT [dbo].[Approval_History] ([history_id], [application_id], [action_by], [role_at_action], [action], [comments], [action_at]) VALUES (22, 18, 1018, N'HR_ADMIN', N'SELECTED', N'Application selected using RANDOM. Rooms requested: 1', CAST(N'2026-08-26T11:31:05.323' AS DateTime))
GO
SET IDENTITY_INSERT [dbo].[Approval_History] OFF
GO
SET IDENTITY_INSERT [dbo].[Batches] ON 
GO
INSERT [dbo].[Batches] ([Batch_id], [trip_id], [start_date], [end_date], [number_of_rooms], [is_active], [created_at], [created_by]) VALUES (1, 2, CAST(N'2026-07-26T00:00:00.000' AS DateTime), CAST(N'2026-07-30T00:00:00.000' AS DateTime), 10, 1, CAST(N'2026-08-11T14:09:34.367' AS DateTime), 1015)
GO
INSERT [dbo].[Batches] ([Batch_id], [trip_id], [start_date], [end_date], [number_of_rooms], [is_active], [created_at], [created_by]) VALUES (2, 7, CAST(N'2026-08-11T00:00:00.000' AS DateTime), CAST(N'2026-08-11T00:00:00.000' AS DateTime), 10, 1, CAST(N'2026-08-11T14:52:55.630' AS DateTime), 1015)
GO
INSERT [dbo].[Batches] ([Batch_id], [trip_id], [start_date], [end_date], [number_of_rooms], [is_active], [created_at], [created_by]) VALUES (3, 7, CAST(N'2026-08-11T00:00:00.000' AS DateTime), CAST(N'2026-08-11T00:00:00.000' AS DateTime), 0, 1, CAST(N'2026-08-11T14:52:58.047' AS DateTime), 1015)
GO
INSERT [dbo].[Batches] ([Batch_id], [trip_id], [start_date], [end_date], [number_of_rooms], [is_active], [created_at], [created_by]) VALUES (4, 7, CAST(N'2026-08-11T00:00:00.000' AS DateTime), CAST(N'2026-08-11T00:00:00.000' AS DateTime), 0, 1, CAST(N'2026-08-12T00:54:13.327' AS DateTime), 1015)
GO
INSERT [dbo].[Batches] ([Batch_id], [trip_id], [start_date], [end_date], [number_of_rooms], [is_active], [created_at], [created_by]) VALUES (5, 7, CAST(N'2026-08-25T00:00:00.000' AS DateTime), CAST(N'2026-08-27T00:00:00.000' AS DateTime), 5, 1, CAST(N'2026-08-12T00:55:23.023' AS DateTime), 1015)
GO
INSERT [dbo].[Batches] ([Batch_id], [trip_id], [start_date], [end_date], [number_of_rooms], [is_active], [created_at], [created_by]) VALUES (6, 10, CAST(N'2026-09-01T00:00:00.000' AS DateTime), CAST(N'2026-09-09T00:00:00.000' AS DateTime), 20, 1, CAST(N'2026-08-25T14:21:11.577' AS DateTime), 1018)
GO
SET IDENTITY_INSERT [dbo].[Batches] OFF
GO
SET IDENTITY_INSERT [dbo].[Employees] ON 
GO
INSERT [dbo].[Employees] ([employee_id], [employee_number], [full_name], [email], [department_id], [manager_id], [role_id], [is_active], [created_at], [created_by], [modify_at], [modify_by], [password]) VALUES (1015, N'EMP001', N'Ahmed Hassan', NULL, NULL, 1019, 1, 1, CAST(N'2026-08-10T16:10:24.140' AS DateTime), 1015, NULL, NULL, N'$2a$10$S4mkJMpVa5nxYGCx4qL5TeHiigtzbIXteBg7.j6rCpdE.RUJw/zT6')
GO
INSERT [dbo].[Employees] ([employee_id], [employee_number], [full_name], [email], [department_id], [manager_id], [role_id], [is_active], [created_at], [created_by], [modify_at], [modify_by], [password]) VALUES (1017, N'MGR001', N'Manager Ahmed', N'manager001@tripsystem.com', NULL, NULL, 3, 1, CAST(N'2026-08-12T00:02:43.683' AS DateTime), NULL, NULL, NULL, N'$2a$10$1d0xcThNm8XE1eGN8Wr9beinkVsaR/6rXzK8qABUxAu9LoEGLeD5m')
GO
INSERT [dbo].[Employees] ([employee_id], [employee_number], [full_name], [email], [department_id], [manager_id], [role_id], [is_active], [created_at], [created_by], [modify_at], [modify_by], [password]) VALUES (1018, N'HR001', N'HR Test', N'hr001@tripsystem.com', NULL, NULL, 4, 1, CAST(N'2026-08-23T12:26:11.283' AS DateTime), NULL, NULL, NULL, N'$2a$10$S4mkJMpVa5nxYGCx4qL5TeHiigtzbIXteBg7.j6rCpdE.RUJw/zT6')
GO
INSERT [dbo].[Employees] ([employee_id], [employee_number], [full_name], [email], [department_id], [manager_id], [role_id], [is_active], [created_at], [created_by], [modify_at], [modify_by], [password]) VALUES (1019, N'LM001', N'Line Manager Test', N'linemanager@test.com', NULL, NULL, 5, 1, CAST(N'2026-08-24T10:23:30.600' AS DateTime), NULL, NULL, NULL, N'$2a$10$S4mkJMpVa5nxYGCx4qL5TeHiigtzbIXteBg7.j6rCpdE.RUJw/zT6')
GO
INSERT [dbo].[Employees] ([employee_id], [employee_number], [full_name], [email], [department_id], [manager_id], [role_id], [is_active], [created_at], [created_by], [modify_at], [modify_by], [password]) VALUES (1020, N'HRM001', N'HR Manager Test', N'hrmanager@test.com', NULL, NULL, 3, 1, CAST(N'2026-08-25T11:18:59.937' AS DateTime), NULL, NULL, NULL, N'$2a$10$S4mkJMpVa5nxYGCx4qL5TeHiigtzbIXteBg7.j6rCpdE.RUJw/zT6')
GO
SET IDENTITY_INSERT [dbo].[Employees] OFF
GO
SET IDENTITY_INSERT [dbo].[FieldType] ON 
GO
INSERT [dbo].[FieldType] ([TypeID], [TypeName]) VALUES (5, N'Date and Time ')
GO
INSERT [dbo].[FieldType] ([TypeID], [TypeName]) VALUES (4, N'Dropdown')
GO
INSERT [dbo].[FieldType] ([TypeID], [TypeName]) VALUES (1, N'Free text')
GO
INSERT [dbo].[FieldType] ([TypeID], [TypeName]) VALUES (3, N'Multiple choice')
GO
INSERT [dbo].[FieldType] ([TypeID], [TypeName]) VALUES (2, N'Radio button')
GO
SET IDENTITY_INSERT [dbo].[FieldType] OFF
GO
SET IDENTITY_INSERT [dbo].[Roles] ON 
GO
INSERT [dbo].[Roles] ([role_id], [role_name], [is_active]) VALUES (1, N'EMPLOYEE', 1)
GO
INSERT [dbo].[Roles] ([role_id], [role_name], [is_active]) VALUES (3, N'HR_MANAGER', 1)
GO
INSERT [dbo].[Roles] ([role_id], [role_name], [is_active]) VALUES (4, N'HR_ADMIN', 1)
GO
INSERT [dbo].[Roles] ([role_id], [role_name], [is_active]) VALUES (5, N'LINE_MANAGER', 1)
GO
SET IDENTITY_INSERT [dbo].[Roles] OFF
GO
SET IDENTITY_INSERT [dbo].[selection_requests] ON 
GO
INSERT [dbo].[selection_requests] ([selection_request_id], [trip_id], [batch_id], [requested_by], [method], [status], [rejection_reason], [reviewed_by], [requested_at], [reviewed_at]) VALUES (1, 10, 6, 1018, N'RANDOM', N'APPROVED', NULL, 1020, CAST(N'2026-08-25T15:52:56.0420632' AS DateTime2), CAST(N'2026-08-26T11:31:05.2954119' AS DateTime2))
GO
SET IDENTITY_INSERT [dbo].[selection_requests] OFF
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (1, N'Approved')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (2, N'Rejected')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (3, N'Pending')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (4, N'ACTIVE')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (5, N'DRAFT')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (6, N'PENDING_APPROVAL')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (7, N'PENDING_MANAGER')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (8, N'APPROVED_BY_MANAGER')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (9, N'IN_SELECTION')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (10, N'RETURNED')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (11, N'CANCELLED')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (12, N'REJECTED_BY_MANAGER')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (13, N'SELECTED')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (14, N'NOT_SELECTED')
GO
INSERT [dbo].[Status] ([Status_id], [StatusName]) VALUES (15, N'WAITLIST')
GO
SET IDENTITY_INSERT [dbo].[Trips] ON 
GO
INSERT [dbo].[Trips] ([trip_id], [title], [destination], [status_id], [created_by], [created_at], [is_active], [registration_open], [registration_close], [duration_days], [allocationMethod], [confirmedQuota], [waitlistQuota], [announcementMessage]) VALUES (2, N'Steigenberger El Gouna', N'El Gouna', 4, 1015, CAST(N'2026-08-11T11:01:25.317' AS DateTime), 1, CAST(N'2026-07-20T09:00:00.000' AS DateTime), CAST(N'2026-08-31T16:00:00.000' AS DateTime), 5, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[Trips] ([trip_id], [title], [destination], [status_id], [created_by], [created_at], [is_active], [registration_open], [registration_close], [duration_days], [allocationMethod], [confirmedQuota], [waitlistQuota], [announcementMessage]) VALUES (5, N'string', N'string', 5, 1015, CAST(N'2026-08-11T12:33:29.773' AS DateTime), NULL, CAST(N'2026-08-11T09:27:22.543' AS DateTime), CAST(N'2026-08-11T09:27:22.543' AS DateTime), 0, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[Trips] ([trip_id], [title], [destination], [status_id], [created_by], [created_at], [is_active], [registration_open], [registration_close], [duration_days], [allocationMethod], [confirmedQuota], [waitlistQuota], [announcementMessage]) VALUES (6, N'string', N'string', 5, 1015, CAST(N'2026-08-11T12:33:54.297' AS DateTime), NULL, CAST(N'2026-08-11T09:33:49.083' AS DateTime), CAST(N'2026-08-11T09:33:49.083' AS DateTime), 0, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[Trips] ([trip_id], [title], [destination], [status_id], [created_by], [created_at], [is_active], [registration_open], [registration_close], [duration_days], [allocationMethod], [confirmedQuota], [waitlistQuota], [announcementMessage]) VALUES (7, N'Test Trip', N'Cairo', 10, 1015, CAST(N'2026-08-11T14:37:33.873' AS DateTime), NULL, CAST(N'2026-08-11T00:00:00.000' AS DateTime), CAST(N'2026-08-30T23:59:59.000' AS DateTime), 3, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[Trips] ([trip_id], [title], [destination], [status_id], [created_by], [created_at], [is_active], [registration_open], [registration_close], [duration_days], [allocationMethod], [confirmedQuota], [waitlistQuota], [announcementMessage]) VALUES (8, N'Test Trip', N'Cairo', 7, 1015, CAST(N'2026-08-11T15:30:14.227' AS DateTime), 1, CAST(N'2026-08-12T09:00:00.000' AS DateTime), CAST(N'2026-08-30T16:00:00.000' AS DateTime), 3, NULL, NULL, NULL, NULL)
GO
INSERT [dbo].[Trips] ([trip_id], [title], [destination], [status_id], [created_by], [created_at], [is_active], [registration_open], [registration_close], [duration_days], [allocationMethod], [confirmedQuota], [waitlistQuota], [announcementMessage]) VALUES (10, N'france', N'paris', 4, 1018, CAST(N'2026-08-25T14:21:11.420' AS DateTime), NULL, CAST(N'2026-08-25T14:20:00.000' AS DateTime), CAST(N'2026-08-31T14:20:00.000' AS DateTime), 8, NULL, NULL, NULL, NULL)
GO
SET IDENTITY_INSERT [dbo].[Trips] OFF
GO
/****** Object:  Index [UQ_Employee_Trip]    Script Date: 8/30/2026 2:16:20 PM ******/
ALTER TABLE [dbo].[Applications] ADD  CONSTRAINT [UQ_Employee_Trip] UNIQUE NONCLUSTERED 
(
	[employee_id] ASC,
	[trip_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__8C453B0D23096AB9]    Script Date: 8/30/2026 2:16:20 PM ******/
ALTER TABLE [dbo].[Employees] ADD  CONSTRAINT [UQ__Users__8C453B0D23096AB9] UNIQUE NONCLUSTERED 
(
	[employee_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__AB6E61642F64D30F]    Script Date: 8/30/2026 2:16:20 PM ******/
ALTER TABLE [dbo].[Employees] ADD  CONSTRAINT [UQ__Users__AB6E61642F64D30F] UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__FieldTyp__D4E7DFA8AB24DAE3]    Script Date: 8/30/2026 2:16:20 PM ******/
ALTER TABLE [dbo].[FieldType] ADD UNIQUE NONCLUSTERED 
(
	[TypeName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Roles__783254B197C14174]    Script Date: 8/30/2026 2:16:20 PM ******/
ALTER TABLE [dbo].[Roles] ADD  CONSTRAINT [UQ__Roles__783254B197C14174] UNIQUE NONCLUSTERED 
(
	[role_name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Applications] ADD  CONSTRAINT [DF_Applications_Status]  DEFAULT ((5)) FOR [Status_id]
GO
ALTER TABLE [dbo].[Applications] ADD  CONSTRAINT [DF__Applicati__creat__5EBF139D]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Approval_History] ADD  DEFAULT (getdate()) FOR [action_at]
GO
ALTER TABLE [dbo].[Departments] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Departments] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Employees] ADD  CONSTRAINT [DF__Users__is_active__4F7CD00D]  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[Employees] ADD  CONSTRAINT [DF__Users__created_a__5070F446]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Trips] ADD  CONSTRAINT [DF_Trips_Status]  DEFAULT ((5)) FOR [status_id]
GO
ALTER TABLE [dbo].[Trips] ADD  CONSTRAINT [DF__Trips__created_a__571DF1D5]  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Answers]  WITH CHECK ADD  CONSTRAINT [FK_Answers_Trips] FOREIGN KEY([Trip_id])
REFERENCES [dbo].[Trips] ([trip_id])
GO
ALTER TABLE [dbo].[Answers] CHECK CONSTRAINT [FK_Answers_Trips]
GO
ALTER TABLE [dbo].[Application_Participants]  WITH CHECK ADD  CONSTRAINT [FK__Applicati__appli__628FA481] FOREIGN KEY([application_id])
REFERENCES [dbo].[Applications] ([application_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Application_Participants] CHECK CONSTRAINT [FK__Applicati__appli__628FA481]
GO
ALTER TABLE [dbo].[Applications]  WITH CHECK ADD  CONSTRAINT [FK_Applications_Batches] FOREIGN KEY([batch_id])
REFERENCES [dbo].[Batches] ([Batch_id])
GO
ALTER TABLE [dbo].[Applications] CHECK CONSTRAINT [FK_Applications_Batches]
GO
ALTER TABLE [dbo].[Applications]  WITH CHECK ADD  CONSTRAINT [FK_Applications_Employees] FOREIGN KEY([employee_id])
REFERENCES [dbo].[Employees] ([employee_id])
GO
ALTER TABLE [dbo].[Applications] CHECK CONSTRAINT [FK_Applications_Employees]
GO
ALTER TABLE [dbo].[Applications]  WITH CHECK ADD  CONSTRAINT [FK_Applications_Status] FOREIGN KEY([Status_id])
REFERENCES [dbo].[Status] ([Status_id])
GO
ALTER TABLE [dbo].[Applications] CHECK CONSTRAINT [FK_Applications_Status]
GO
ALTER TABLE [dbo].[Applications]  WITH CHECK ADD  CONSTRAINT [FK_Applications_Trips] FOREIGN KEY([trip_id])
REFERENCES [dbo].[Trips] ([trip_id])
GO
ALTER TABLE [dbo].[Applications] CHECK CONSTRAINT [FK_Applications_Trips]
GO
ALTER TABLE [dbo].[Approval_History]  WITH CHECK ADD  CONSTRAINT [FK__Approval___appli__66603565] FOREIGN KEY([application_id])
REFERENCES [dbo].[Applications] ([application_id])
GO
ALTER TABLE [dbo].[Approval_History] CHECK CONSTRAINT [FK__Approval___appli__66603565]
GO
ALTER TABLE [dbo].[Approval_History]  WITH CHECK ADD  CONSTRAINT [FK_ApprovalHistory_Employees] FOREIGN KEY([action_by])
REFERENCES [dbo].[Employees] ([employee_id])
GO
ALTER TABLE [dbo].[Approval_History] CHECK CONSTRAINT [FK_ApprovalHistory_Employees]
GO
ALTER TABLE [dbo].[Batches]  WITH CHECK ADD  CONSTRAINT [FK_Batches_Employees] FOREIGN KEY([created_by])
REFERENCES [dbo].[Employees] ([employee_id])
GO
ALTER TABLE [dbo].[Batches] CHECK CONSTRAINT [FK_Batches_Employees]
GO
ALTER TABLE [dbo].[Batches]  WITH CHECK ADD  CONSTRAINT [FK_Batches_Trips] FOREIGN KEY([trip_id])
REFERENCES [dbo].[Trips] ([trip_id])
GO
ALTER TABLE [dbo].[Batches] CHECK CONSTRAINT [FK_Batches_Trips]
GO
ALTER TABLE [dbo].[Employees]  WITH CHECK ADD  CONSTRAINT [FK_Employees_Departments] FOREIGN KEY([department_id])
REFERENCES [dbo].[Departments] ([department_id])
GO
ALTER TABLE [dbo].[Employees] CHECK CONSTRAINT [FK_Employees_Departments]
GO
ALTER TABLE [dbo].[Employees]  WITH CHECK ADD  CONSTRAINT [FK_Employees_Roles] FOREIGN KEY([role_id])
REFERENCES [dbo].[Roles] ([role_id])
GO
ALTER TABLE [dbo].[Employees] CHECK CONSTRAINT [FK_Employees_Roles]
GO
ALTER TABLE [dbo].[Fields]  WITH CHECK ADD  CONSTRAINT [FK_Fields_FieldType] FOREIGN KEY([TypeID])
REFERENCES [dbo].[FieldType] ([TypeID])
GO
ALTER TABLE [dbo].[Fields] CHECK CONSTRAINT [FK_Fields_FieldType]
GO
ALTER TABLE [dbo].[selection_requests]  WITH CHECK ADD  CONSTRAINT [FK_selection_requests_batch] FOREIGN KEY([batch_id])
REFERENCES [dbo].[Batches] ([Batch_id])
GO
ALTER TABLE [dbo].[selection_requests] CHECK CONSTRAINT [FK_selection_requests_batch]
GO
ALTER TABLE [dbo].[selection_requests]  WITH CHECK ADD  CONSTRAINT [FK_selection_requests_requested_by] FOREIGN KEY([requested_by])
REFERENCES [dbo].[Employees] ([employee_id])
GO
ALTER TABLE [dbo].[selection_requests] CHECK CONSTRAINT [FK_selection_requests_requested_by]
GO
ALTER TABLE [dbo].[selection_requests]  WITH CHECK ADD  CONSTRAINT [FK_selection_requests_reviewed_by] FOREIGN KEY([reviewed_by])
REFERENCES [dbo].[Employees] ([employee_id])
GO
ALTER TABLE [dbo].[selection_requests] CHECK CONSTRAINT [FK_selection_requests_reviewed_by]
GO
ALTER TABLE [dbo].[selection_requests]  WITH CHECK ADD  CONSTRAINT [FK_selection_requests_trip] FOREIGN KEY([trip_id])
REFERENCES [dbo].[Trips] ([trip_id])
GO
ALTER TABLE [dbo].[selection_requests] CHECK CONSTRAINT [FK_selection_requests_trip]
GO
ALTER TABLE [dbo].[Trips]  WITH CHECK ADD  CONSTRAINT [FK_Trips_Employees] FOREIGN KEY([created_by])
REFERENCES [dbo].[Employees] ([employee_id])
GO
ALTER TABLE [dbo].[Trips] CHECK CONSTRAINT [FK_Trips_Employees]
GO
ALTER TABLE [dbo].[Trips]  WITH CHECK ADD  CONSTRAINT [FK_Trips_Status] FOREIGN KEY([status_id])
REFERENCES [dbo].[Status] ([Status_id])
GO
ALTER TABLE [dbo].[Trips] CHECK CONSTRAINT [FK_Trips_Status]
GO
ALTER TABLE [dbo].[Applications]  WITH CHECK ADD  CONSTRAINT [CK__Applicati__trans__5CD6CB2B] CHECK  (([transport_type]='TRIP_BUS' OR [transport_type]='PRIVATE_CAR'))
GO
ALTER TABLE [dbo].[Applications] CHECK CONSTRAINT [CK__Applicati__trans__5CD6CB2B]
GO
USE [master]
GO
ALTER DATABASE [trips] SET  READ_WRITE 
GO
