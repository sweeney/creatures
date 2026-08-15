object PreviewForm: TPreviewForm
  Left = 170
  Top = 96
  BorderIcons = [biSystemMenu]
  BorderStyle = bsSingle
  Caption = 'Preview'
  ClientHeight = 434
  ClientWidth = 632
  Font.Color = clWindowText
  Font.Height = -13
  Font.Name = 'System'
  Font.Style = []
  Menu = PreviewMenu
  PixelsPerInch = 96
  Position = poScreenCenter
  OnCreate = FormCreate
  OnHide = FormHide
  OnPaint = FormPaint
  OnShow = FormShow
  TextHeight = 16
  object PreviewImage: TImage
    Left = 608
    Top = 0
    Width = 23
    Height = 27
  end
  object Bevel1: TBevel
    Left = 1
    Top = 353
    Width = 629
    Height = 2
  end
  object label1: TLabel
    Left = 73
    Top = 367
    Width = 87
    Height = 16
    Caption = 'Depth of strip'
  end
  object Label2: TLabel
    Left = 13
    Top = 399
    Width = 147
    Height = 16
    Caption = 'Starting Position at top'
  end
  object Label3: TLabel
    Left = 235
    Top = 367
    Width = 93
    Height = 16
    Caption = 'Length of strip'
  end
  object Label4: TLabel
    Left = 235
    Top = 399
    Width = 108
    Height = 16
    Caption = 'Number of strips'
  end
  object Label5: TLabel
    Left = 428
    Top = 364
    Width = 106
    Height = 16
    Caption = 'Inter-Strip space'
  end
  object Label6: TLabel
    Left = 558
    Top = 24
    Width = 61
    Height = 16
    Caption = 'Font Size'
  end
  object Label7: TLabel
    Left = 3
    Top = 4
    Width = 70
    Height = 16
    Caption = 'Set Y Scale'
    Font.Color = clWindowText
    Font.Height = -13
    Font.Name = 'Arial'
    Font.Style = []
    ParentFont = False
  end
  object btnPreviewOK: TButton
    Left = 4
    Top = 358
    Width = 62
    Height = 37
    Caption = 'Return'
    ModalResult = 1
    TabOrder = 0
  end
  object btnPreview: TButton
    Left = 540
    Top = 360
    Width = 88
    Height = 32
    Caption = 'Preview'
    TabOrder = 1
    Visible = False
    OnClick = btnPreviewClick
  end
  object BtnPrint: TBitBtn
    Left = 540
    Top = 396
    Width = 88
    Height = 32
    Caption = 'Print'
    TabOrder = 2
    OnClick = BtnPrintClick
    Glyph.Data = {
      78010000424D7801000000000000760000002800000020000000100000000100
      04000000000000000000120B0000120B00000000000000000000000000000000
      800000800000008080008000000080008000808000007F7F7F00BFBFBF000000
      FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00300000000000
      0003377777777777777308888888888888807F33333333333337088888888888
      88807FFFFFFFFFFFFFF7000000000000000077777777777777770F8F8F8F8F8F
      8F807F333333333333F708F8F8F8F8F8F9F07F333333333337370F8F8F8F8F8F
      8F807FFFFFFFFFFFFFF7000000000000000077777777777777773330FFFFFFFF
      ... (380 bytes total)
    }
    NumGlyphs = 2
  end
  object SpinStrips: TSpinEdit
    Left = 351
    Top = 394
    Width = 58
    Height = 26
    MaxLength = 1
    MaxValue = 3
    MinValue = 1
    TabOrder = 3
    Value = 1
    OnChange = SpinStripsChange
  end
  object Panel12: TPanel
    Left = 16
    Top = 27
    Width = 33
    Height = 315
    TabOrder = 4
    object YScale50: TPanel
      Tag = 1
      Left = 1
      Top = 1
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '50'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 0
      OnClick = YScale50Click
    end
    object Yscale100: TPanel
      Tag = 2
      Left = 1
      Top = 27
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '100'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 1
      OnClick = YScale50Click
    end
    object YScale250: TPanel
      Tag = 3
      Left = 1
      Top = 53
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '250'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 2
      OnClick = YScale50Click
    end
    object YScale500: TPanel
      Tag = 4
      Left = 1
      Top = 79
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '500'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 3
      OnClick = YScale50Click
    end
    object YScale1000: TPanel
      Tag = 5
      Left = 1
      Top = 105
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '1000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 4
      OnClick = YScale50Click
    end
    object YScale1500: TPanel
      Tag = 6
      Left = 1
      Top = 131
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '1500'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 5
      OnClick = YScale50Click
    end
    object YScale2000: TPanel
      Tag = 7
      Left = 1
      Top = 157
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '2000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 6
      OnClick = YScale50Click
    end
    object YScale2500: TPanel
      Tag = 8
      Left = 1
      Top = 183
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '2500'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 7
      OnClick = YScale50Click
    end
    object YScale3000: TPanel
      Tag = 9
      Left = 1
      Top = 209
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '3000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 8
      OnClick = YScale50Click
    end
    object YScale4000: TPanel
      Tag = 10
      Left = 1
      Top = 234
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '4000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 9
      OnClick = YScale50Click
    end
    object YScale5000: TPanel
      Tag = 11
      Left = 1
      Top = 260
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '5000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 10
      OnClick = YScale50Click
    end
    object YScale6000: TPanel
      Tag = 12
      Left = 1
      Top = 286
      Width = 31
      Height = 27
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '6000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 11
      OnClick = YScale50Click
    end
  end
  object EditDepthcms: TSpinfltEdit
    Left = 165
    Top = 363
    Width = 58
    Height = 26
    Increment = 0.1
    MaxLength = 4
    MaxValue = 28.0
    MinValue = 0.5
    TabOrder = 5
    OnChange = EditDepthcmsChange
    OnKeyDown = EditDepthcmsKeyDown
  end
  object EditLength: TSpinfltEdit
    Left = 351
    Top = 362
    Width = 58
    Height = 26
    Increment = 0.1
    MaxLength = 4
    MaxValue = 30.0
    MinValue = 0.5
    TabOrder = 6
    OnChange = EditLengthChange
    OnKeyDown = EditLengthKeyDown
  end
  object EditPosnTop: TSpinfltEdit
    Left = 165
    Top = 397
    Width = 58
    Height = 26
    Increment = 0.1
    MaxLength = 4
    MaxValue = 20.0
    MinValue = 0.1
    TabOrder = 7
    OnChange = EditPosnTopChange
    OnKeyDown = EditPosnTopKeyDown
  end
  object EditInterSpace: TSpinfltEdit
    Left = 453
    Top = 391
    Width = 58
    Height = 26
    Increment = 0.1
    MaxLength = 4
    MaxValue = 20.0
    TabOrder = 8
    OnChange = EditInterSpaceChange
    OnKeyDown = EditInterSpaceKeyDown
  end
  object ComboBox1: TComboBox
    Left = 562
    Top = 49
    Width = 53
    Height = 24
    ItemHeight = 16
    Items.Strings = ('4' '5' '6' '7' '8' '9' '10' '11' '12' '14' '16' '18' '20' '24' '26' '28' '36' '')
    TabOrder = 9
    Text = '14'
    OnChange = ComboBox1Change
  end
  object PrintDialog1: TPrintDialog
    Copies = 1
    FromPage = 1
    MinPage = 1
    MaxPage = 1
    ToPage = 1
    Left = 606
    Top = 322
  end
  object PreviewMenu: TMainMenu
    Left = 552
    Top = 322
    object File1: TMenuItem
      Caption = 'File'
      object PrintGraph1: TMenuItem
        Caption = 'Print Graph'
        OnClick = BtnPrintClick
      end
      object PrintSetup1: TMenuItem
        Caption = 'Printer Setup'
        OnClick = PrintSetup1Click
      end
    end
    object mnuOptions: TMenuItem
      Caption = 'Options'
      object mnuBrokenLines: TMenuItem
        Caption = 'Use Broken Lines'
        OnClick = mnuBrokenLinesClick
      end
      object mnuColouredLines: TMenuItem
        Caption = 'Use Coloured Lines on Screen'
        OnClick = mnuColouredLinesClick
      end
      object N1: TMenuItem
        Caption = '-'
      end
      object mnuAddLegend: TMenuItem
        Caption = 'Add Legend'
        OnClick = mnuAddLegendClick
      end
    end
    object CopyGraphtoClipboard1: TMenuItem
      Caption = 'Copy Graph to Clipboard'
      OnClick = CopyGraphtoClipboard1Click
    end
  end
  object PrinterSetupDialog1: TPrinterSetupDialog
    Left = 578
    Top = 322
  end
end
