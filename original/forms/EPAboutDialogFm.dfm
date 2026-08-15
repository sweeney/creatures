object EPAboutDialogFm: TEPAboutDialogFm
  Left = 422
  Top = 363
  ActiveControl = OKBt
  BorderIcons = [biSystemMenu]
  BorderStyle = bsDialog
  Caption = 'About'
  ClientHeight = 197
  ClientWidth = 400
  Font.Color = clBlack
  Font.Height = -11
  Font.Name = 'MS Sans Serif'
  Font.Style = [fsBold]
  PixelsPerInch = 96
  Position = poScreenCenter
  TextHeight = 13
  object ProductLb: TLabel
    Left = 60
    Top = 12
    Width = 86
    Height = 16
    Caption = '<<Product>>'
    Font.Color = clBlack
    Font.Height = -13
    Font.Name = 'MS Sans Serif'
    Font.Style = [fsBold]
    ParentFont = False
  end
  object CopyrightLb: TLabel
    Left = 60
    Top = 32
    Width = 82
    Height = 13
    Caption = '<<Copyright>>'
  end
  object TLabel
    Left = 60
    Top = 48
    Width = 107
    Height = 13
    Caption = 'All rights reserved.'
  end
  object DescriptionLb: TLabel
    Left = 60
    Top = 80
    Width = 93
    Height = 13
    Caption = '<<Description>>'
    Font.Color = clBlack
    Font.Height = -11
    Font.Name = 'MS Sans Serif'
    Font.Style = [fsBold]
    ParentFont = False
  end
  object SerialLb: TLabel
    Left = 60
    Top = 116
    Width = 61
    Height = 13
    Caption = '<<Serial>>'
    Font.Color = clBlack
    Font.Height = -11
    Font.Name = 'MS Sans Serif'
    Font.Style = [fsBold]
    ParentFont = False
  end
  object Bevel1: TBevel
    Left = 60
    Top = 132
    Width = 329
    Height = 9
    Shape = bsTopLine
  end
  object CPUModeLb: TLabel
    Left = 60
    Top = 140
    Width = 107
    Height = 13
    Caption = 'Intel %s - %s Mode'
    Font.Color = clBlack
    Font.Height = -11
    Font.Name = 'MS Sans Serif'
    Font.Style = [fsBold]
    ParentFont = False
  end
  object TLabel
    Left = 60
    Top = 160
    Width = 91
    Height = 13
    Caption = 'System memory:'
    Font.Color = clBlack
    Font.Height = -11
    Font.Name = 'MS Sans Serif'
    Font.Style = [fsBold]
    ParentFont = False
  end
  object TLabel
    Left = 60
    Top = 176
    Width = 104
    Height = 13
    Caption = 'System resources:'
    Font.Color = clBlack
    Font.Height = -11
    Font.Name = 'MS Sans Serif'
    Font.Style = [fsBold]
    ParentFont = False
  end
  object MemoryLb: TLabel
    Left = 184
    Top = 160
    Width = 54
    Height = 13
    Caption = '%d Kb Free'
    Font.Color = clBlack
    Font.Height = -11
    Font.Name = 'MS Sans Serif'
    Font.Style = []
    ParentFont = False
  end
  object ResourcesLb: TLabel
    Left = 184
    Top = 176
    Width = 54
    Height = 13
    Caption = '%d%% Free'
    Font.Color = clBlack
    Font.Height = -11
    Font.Name = 'MS Sans Serif'
    Font.Style = []
    ParentFont = False
  end
  object AboutIm: TEPImage
    Left = 12
    Top = 12
    Width = 32
    Height = 32
  end
  object OKBt: TButton
    Left = 300
    Top = 12
    Width = 89
    Height = 25
    Cancel = True
    Caption = 'OK'
    Default = True
    ModalResult = 1
    TabOrder = 0
  end
end
