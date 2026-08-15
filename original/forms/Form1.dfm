object Form1: TForm1
  Left = 89
  Top = 103
  BorderIcons = [biSystemMenu, biMinimize]
  BorderStyle = bsSingle
  Caption = 'Foxes and Rabbits Simulator'
  ClientHeight = 433
  ClientWidth = 632
  Font.Color = clWindowText
  Font.Height = -13
  Font.Name = 'System'
  Font.Style = []
  Menu = MainMenu1
  PixelsPerInch = 96
  Position = poScreenCenter
  OnCreate = FormCreate
  OnDestroy = FormDestroy
  OnPaint = FormPaint
  OnShow = FormShow
  TextHeight = 16
  object Bevel4: TBevel
    Left = 4
    Top = 4
    Width = 246
    Height = 246
    Style = bsRaised
  end
  object FieldonScreen: TPaintBox
    Left = 6
    Top = 6
    Width = 242
    Height = 242
    PopupMenu = PopupFieldOptions
    OnClick = FieldonScreenClick
    OnMouseDown = FieldonScreenMouseDown
    OnPaint = FieldonScreenPaint
  end
  object btnStop: TSpeedButton
    Left = 6
    Top = 266
    Width = 77
    Height = 44
    Caption = 'Stop'
    Font.Color = clRed
    Font.Height = -16
    Font.Name = 'Arial'
    Font.Style = [fsBold]
    ParentFont = False
    OnClick = btnStopClick
  end
  object btnStart: TSpeedButton
    Left = 178
    Top = 266
    Width = 75
    Height = 44
    Caption = 'Start'
    Font.Color = clGreen
    Font.Height = -16
    Font.Name = 'Arial'
    Font.Style = [fsBold]
    ParentFont = False
    OnClick = btnStartClick
  end
  object Label9: TLabel
    Left = 80
    Top = 405
    Width = 89
    Height = 22
    Caption = 'Simulator'
    Font.Color = clGreen
    Font.Height = -19
    Font.Name = 'Arial'
    Font.Style = [fsBold]
    ParentFont = False
  end
  object BtnOneGen: TSpeedButton
    Left = 82
    Top = 266
    Width = 97
    Height = 44
    Hint = 'Click to move on ONE generation'
    Caption = 'One Generation'
    Font.Color = clWindowText
    Font.Height = -11
    Font.Name = 'Arial'
    Font.Style = []
    ParentFont = False
    ParentShowHint = False
    ShowHint = True
    OnClick = BtnOneGenClick
  end
  object Bevel2: TBevel
    Left = 544
    Top = 206
    Width = 85
    Height = 5
  end
  object ExitBtn: TSpeedButton
    Left = 544
    Top = 352
    Width = 85
    Height = 77
    Caption = 'Exit'
    Glyph.Data = {
      B0070000424DB007000000000000360400002800000023000000180000000100
      0800000000006003000000000000000000000000000000000000000000000000
      80000080000000808000800000008000800080800000C0C0C000C0DCC000F0C8
      A400000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000000
      0000000000000000000000000000000000000000000000000000000000000000
      ... (1972 bytes total)
    }
    OnClick = ExitBtnClick
  end
  object Label17: TLabel
    Left = 41
    Top = 385
    Width = 172
    Height = 22
    Caption = 'Foxes and Rabbits'
    Font.Color = clGreen
    Font.Height = -19
    Font.Name = 'Arial'
    Font.Style = [fsBold]
    ParentFont = False
  end
  object EPImage1: TEPImage
    Left = 546
    Top = 286
    Width = 79
    Height = 59
    Picture.Data = {
      07544269746D6170A6160000424D7E1200000000000036040000280000004F00
      00003B000000010008000000000070120000C4080000C4080000000000000000
      000000000000000080000080000000808000800000008000800080800000C0C0
      C000C0DCC000F0C8A40040000000A0000000C000000000400000404000008040
      0000A0400000C0400000FF40000040800000A0800000C0800000FF80000000A0
      000040A0000080A00000A0A00000C0A00000FFA0000000C0000040C0000080C0
      0000A0C00000C0C00000FFC0000040FF000080FF0000A0FF0000C0FF00000000
      40004000400080004000A0004000C0004000FF00400000404000404040008040
      ... (5810 bytes total)
    }
    Transparent = True
  end
  object Bevel6: TBevel
    Left = 8
    Top = 326
    Width = 243
    Height = 3
  end
  object DummyBtn: TButton
    Left = 280
    Top = 32
    Width = 25
    Height = 17
    TabOrder = 6
  end
  object GroupBox1: TGroupBox
    Left = 544
    Top = 218
    Width = 85
    Height = 59
    Caption = 'Generation'
    TabOrder = 0
    object nGeneration: TPanel
      Left = 16
      Top = 20
      Width = 55
      Height = 25
      BevelOuter = bvLowered
      BevelWidth = 2
      BorderWidth = 3
      Caption = '0'
      Color = clBlack
      Font.Color = clWhite
      Font.Height = -13
      Font.Name = 'System'
      Font.Style = []
      ParentFont = False
      TabOrder = 0
    end
  end
  object StatusBox: TGroupBox
    Left = 544
    Top = -3
    Width = 85
    Height = 204
    Caption = ' Status '
    TabOrder = 1
    OnClick = StatusBoxClick
    object Label1: TLabel
      Left = 10
      Top = 74
      Width = 50
      Height = 16
      Caption = 'Rabbits'
      Font.Color = clNavy
      Font.Height = -13
      Font.Name = 'System'
      Font.Style = []
      ParentFont = False
    end
    object Label3: TLabel
      Left = 10
      Top = 121
      Width = 40
      Height = 16
      Caption = 'Foxes'
      Font.Color = clRed
      Font.Height = -13
      Font.Name = 'System'
      Font.Style = []
      ParentFont = False
    end
    object run_status_lbl: TLabel
      Left = 14
      Top = 180
      Width = 57
      Height = 16
      Caption = 'Stopped '
    end
    object Label2: TLabel
      Left = 10
      Top = 24
      Width = 39
      Height = 16
      Caption = 'Grass'
      Font.Color = clGreen
      Font.Height = -13
      Font.Name = 'System'
      Font.Style = []
      ParentFont = False
    end
    object nRabbits_lbl: TPanel
      Left = 10
      Top = 93
      Width = 65
      Height = 21
      BevelOuter = bvLowered
      BevelWidth = 2
      BorderWidth = 3
      Caption = '0'
      TabOrder = 0
    end
    object nFoxes_lbl: TPanel
      Left = 10
      Top = 141
      Width = 65
      Height = 19
      BevelOuter = bvLowered
      BevelWidth = 2
      BorderWidth = 3
      Caption = '0'
      TabOrder = 1
    end
    object nGrass_lbl: TPanel
      Left = 10
      Top = 44
      Width = 65
      Height = 21
      BevelOuter = bvLowered
      BevelWidth = 2
      BorderWidth = 3
      Caption = '0'
      TabOrder = 2
    end
  end
  object Panel1: TPanel
    Left = 7
    Top = 342
    Width = 247
    Height = 33
    TabOrder = 2
    object btnAddRabbits: TSpeedButton
      Left = 82
      Top = 0
      Width = 82
      Height = 33
      Hint = 'Click on field to add rabbits'
      AllowAllUp = True
      GroupIndex = 1
      Caption = 'Add rabbits'
      Font.Color = clBlue
      Font.Height = -13
      Font.Name = 'System'
      Font.Style = []
      ParentFont = False
      ParentShowHint = False
      ShowHint = True
    end
    object btnAddFoxes: TSpeedButton
      Left = 164
      Top = 0
      Width = 82
      Height = 33
      Hint = 'Click on field to add foxes'
      AllowAllUp = True
      GroupIndex = 1
      Caption = 'Add foxes'
      Font.Color = clRed
      Font.Height = -13
      Font.Name = 'System'
      Font.Style = []
      ParentFont = False
      ParentShowHint = False
      ShowHint = True
    end
    object btnAddGrass: TSpeedButton
      Left = 0
      Top = 0
      Width = 82
      Height = 33
      Hint = 'Click on field to add grass'
      AllowAllUp = True
      GroupIndex = 1
      Caption = 'Add grass'
      Font.Color = clGreen
      Font.Height = -13
      Font.Name = 'System'
      Font.Style = []
      ParentFont = False
      ParentShowHint = False
      ShowHint = True
    end
  end
  object Panel2: TPanel
    Left = 257
    Top = 206
    Width = 283
    Height = 223
    TabOrder = 3
    object Notebook1: TNotebook
      Left = 3
      Top = 6
      Width = 277
      Height = 193
      PageIndex = 3
      TabOrder = 0
      OnPageChanged = Notebook1PageChanged
      object TPage
        Left = 0
        Top = 0
        Caption = 'Main'
        object GroupBox4: TGroupBox
          Left = 2
          Top = -4
          Width = 135
          Height = 195
          TabOrder = 0
          object Label13: TLabel
            Left = 14
            Top = 168
            Width = 53
            Height = 16
            Caption = 'Sunlight'
            Font.Color = clYellow
            Font.Height = -13
            Font.Name = 'System'
            Font.Style = []
            ParentFont = False
          end
          object Label14: TLabel
            Left = 80
            Top = 160
            Width = 35
            Height = 16
            Caption = 'Grass'
            Font.Color = clWindowText
            Font.Height = -13
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Label15: TLabel
            Left = 70
            Top = 176
            Width = 58
            Height = 16
            Caption = 'death rate'
            Font.Color = clWindowText
            Font.Height = -13
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Label16: TLabel
            Left = 110
            Top = 44
            Width = 18
            Height = 14
            Caption = '100'
            Font.Color = clBlack
            Font.Height = -11
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Image2: TImage
            Left = 12
            Top = 18
            Width = 17
            Height = 19
            Picture.Data = {
              07544269746D617010010000424D100100000000000076000000280000001000
              0000100000000100040000000000800000000000000000000000000000000000
              000000000000000080000080000000808000800000008000800080800000C0C0
              C000808080000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFF
              FF00777777770777777777077777077778077B70777B07778B7777B7077B7778
              B777777B7770007B7777777777BBB007777777777BBBBB0077777000BBBBBBB0
              7000BBB7BBBBBBB0BBB77777BBBBBBB7777777777BBBBB777777777807BBB777
              0777778B7777077B707778B7777B0777B7077B77777B07777B777777777B7777
              ... (284 bytes total)
            }
          end
          object Image3: TImage
            Left = 9
            Top = 141
            Width = 19
            Height = 21
            Picture.Data = {
              07544269746D617068010000424D680100000000000076000000280000001200
              0000120000000100040000000000D80000000000000000000000000000000000
              000000000000000080000080000000808000800000008000800080800000C0C0
              C000808080000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFF
              FF007000000000000000070000000000000FFFFF00000000000000000FCCCCCF
              FF00000000000000CCCCCCCCCFF000000000000CCCCCCCCCCCFF0000000000CC
              CCCCCCCCCCCF0000000000CCCCCC00000CCFF00000000CCCCCC0000000CCF000
              00000CCCCC000000000CF00000000CCCCF0000000000F00000000CCCCF0000B0
              ... (372 bytes total)
            }
          end
          object Image4: TImage
            Left = 6
            Top = 79
            Width = 25
            Height = 21
            Picture.Data = {
              07544269746D6170B0010000424DB00100000000000076000000280000001800
              0000180000000100040000000000200100000000000000000000000000000000
              000000000000000080000080000000808000800000008000800080800000C0C0
              C000808080000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFF
              FF00777777777777777777777777777777777777777777777777777777777777
              7777777777777777777777777777777777777788888777778888888888877888
              8888888888888888888878888888888888888888888888888888888888888888
              8887888888888888888888888877888888888888888888888777888888888888
              ... (444 bytes total)
            }
          end
          object Image5: TImage
            Left = 104
            Top = 130
            Width = 29
            Height = 33
            Picture.Data = {
              07544269746D617090020000424D900200000000000076000000280000002000
              0000200000000100040000000000000200000000000000000000000000000000
              000000000000000080000080000000808000800000008000800080800000C0C0
              C000808080000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFF
              FF00777777777777777777777777777777777777777777777777777777777777
              7777777777777333337377733333337777777777777777333373333333377777
              7777777777777777777772777777777777777777777777777777722777777777
              7777777777777777777222277777777777777777777777777772222777777777
              ... (668 bytes total)
            }
          end
          object Image6: TImage
            Left = 100
            Top = 10
            Width = 29
            Height = 29
            Picture.Data = {
              07544269746D617090020000424D900200000000000076000000280000002000
              0000200000000100040000000000000200000000000000000000000000000000
              000000000000000080000080000000808000800000008000800080800000C0C0
              C000808080000000FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFF
              FF00777777777777777777777777777777777777777777777777777777777777
              7777777777777777777777777777777777777777777777777777777777777777
              7777777777773333373777333333377777777777777773333733333333777777
              7777777777373777777737777777777777777777773737777777327777733777
              ... (668 bytes total)
            }
          end
          object Label23: TLabel
            Left = 111
            Top = 57
            Width = 10
            Height = 14
            Caption = '%'
            Font.Color = clBlack
            Font.Height = -11
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Label28: TLabel
            Left = 9
            Top = 44
            Width = 18
            Height = 14
            Caption = '100'
            Font.Color = clBlack
            Font.Height = -11
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Label29: TLabel
            Left = 5
            Top = 49
            Width = 3
            Height = 14
            Font.Color = clBlack
            Font.Height = -11
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Label30: TLabel
            Left = 8
            Top = 57
            Width = 10
            Height = 14
            Caption = '%'
            Font.Color = clBlack
            Font.Height = -11
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object SunSlider: TEPSlider
            Tag = 1
            Left = 37
            Top = 21
            Width = 25
            Height = 139
            BorderSpace = 0
            BorderStyle = epbsNone
            MinValue = 0
            Orientation = epoVertical
            TabOrder = 0
            ThumbHeight = 11
            ThumbStyle = epstsOwnerDraw
            ThumbWidth = 17
            TickStyle = epstsNone
            OnDrawThumb = SunSliderDrawThumb
            OnChange = SunSliderChange
          end
          object GrassDeathSlider: TEPSlider
            Tag = 2
            Left = 74
            Top = 21
            Width = 25
            Height = 139
            BorderSpace = 0
            BorderStyle = epbsNone
            MinValue = 0
            Orientation = epoVertical
            TabOrder = 1
            ThumbHeight = 11
            ThumbStyle = epstsOwnerDraw
            ThumbWidth = 17
            TickStyle = epstsNone
            OnDrawThumb = SunSliderDrawThumb
            OnChange = GrassDeathSliderChange
          end
        end
        object GroupBox3: TGroupBox
          Left = 139
          Top = -4
          Width = 135
          Height = 195
          TabOrder = 1
          object Label4: TLabel
            Left = 27
            Top = 170
            Width = 84
            Height = 16
            Caption = 'Fox death rate'
            Font.Color = clBlack
            Font.Height = -13
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Label5: TLabel
            Left = 14
            Top = 154
            Width = 16
            Height = 14
            Caption = '0%'
            Font.Color = clBlack
            Font.Height = -11
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Label6: TLabel
            Left = 100
            Top = 154
            Width = 28
            Height = 14
            Caption = '100%'
            Font.Color = clBlack
            Font.Height = -11
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Label7: TLabel
            Left = 20
            Top = 101
            Width = 99
            Height = 16
            Caption = 'Rabbit death rate'
            Font.Color = clBlack
            Font.Height = -13
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Label8: TLabel
            Left = 15
            Top = 43
            Width = 106
            Height = 16
            Alignment = taCenter
            Caption = 'Fox hunting ability'
            Font.Color = clBlack
            Font.Height = -13
            Font.Name = 'Arial'
            Font.Style = []
            ParentFont = False
          end
          object Bevel1: TBevel
            Left = 2
            Top = 62
            Width = 131
            Height = 9
            Shape = bsBottomLine
          end
          object Bevel3: TBevel
            Left = 2
            Top = 120
            Width = 131
            Height = 9
            Shape = bsBottomLine
          end
          object FoxHuntSlider: TEPSlider
            Tag = 3
            Left = 14
            Top = 15
            Width = 110
            Height = 19
            ParentShowHint = False
            ShowHint = True
            BorderSpace = 0
            BorderStyle = epbsNone
            MinValue = 0
            Orientation = epoHorizontal
            TabOrder = 0
            ThumbHeight = 17
            ThumbStyle = epstsOwnerDraw
            ThumbWidth = 9
            TickStyle = epstsNone
            OnDrawThumb = SunSliderDrawThumb
            OnChange = FoxHuntSliderChange
          end
          object RDeathSlider: TEPSlider
            Tag = 4
            Left = 14
            Top = 78
            Width = 110
            Height = 19
            ParentShowHint = False
            ShowHint = True
            BorderSpace = 0
            BorderStyle = epbsNone
            MinValue = 0
            Orientation = epoHorizontal
            TabOrder = 1
            ThumbHeight = 17
            ThumbStyle = epstsOwnerDraw
            ThumbWidth = 9
            TickStyle = epstsNone
            OnDrawThumb = SunSliderDrawThumb
            OnChange = RDeathSliderChange
          end
          object FDeathSlider: TEPSlider
            Tag = 5
            Left = 14
            Top = 135
            Width = 110
            Height = 19
            ParentShowHint = False
            ShowHint = True
            BorderSpace = 0
            BorderStyle = epbsNone
            MinValue = 0
            Orientation = epoHorizontal
            TabOrder = 2
            ThumbHeight = 17
            ThumbStyle = epstsOwnerDraw
            ThumbWidth = 9
            TickStyle = epstsNone
            OnDrawThumb = SunSliderDrawThumb
            OnChange = FDeathSliderChange
          end
        end
      end
      object TPage
        Left = 0
        Top = 0
        Caption = 'Field Display'
        object Label26: TLabel
          Left = 26
          Top = 10
          Width = 227
          Height = 21
          Caption = 'Field Display Options '
          Font.Color = clPurple
          Font.Height = -19
          Font.Name = 'Arial Black'
          Font.Style = [fsItalic]
          ParentFont = False
        end
        object GroupBox6: TGroupBox
          Left = 26
          Top = 48
          Width = 225
          Height = 122
          TabOrder = 0
          object chkDisplayGrassInField: TCheckBox
            Left = 20
            Top = 28
            Width = 171
            Height = 19
            Caption = 'Display Grass in Field'
            Font.Color = clGreen
            Font.Height = -13
            Font.Name = 'System'
            Font.Style = []
            ParentFont = False
            TabOrder = 0
            OnClick = chkDisplayGrassInFieldClick
          end
          object chkDisplayRabbitsInField: TCheckBox
            Left = 20
            Top = 56
            Width = 177
            Height = 19
            Caption = 'Display Rabbits in Field'
            Font.Color = clBlue
            Font.Height = -13
            Font.Name = 'System'
            Font.Style = []
            ParentFont = False
            TabOrder = 1
            OnClick = chkDisplayRabbitsInFieldClick
          end
          object chkDisplayFoxesInField: TCheckBox
            Left = 20
            Top = 84
            Width = 171
            Height = 17
            Caption = 'Display Foxes in Field'
            Font.Color = clRed
            Font.Height = -13
            Font.Name = 'System'
            Font.Style = []
            ParentFont = False
            TabOrder = 2
            OnClick = chkDisplayFoxesInFieldClick
          end
        end
      end
      object TPage
        Left = 0
        Top = 0
        Caption = 'Graph Display'
        object Label27: TLabel
          Left = 26
          Top = 10
          Width = 239
          Height = 21
          Caption = 'Graph Display Options '
          Font.Color = clPurple
          Font.Height = -19
          Font.Name = 'Arial Black'
          Font.Style = [fsItalic]
          ParentFont = False
        end
        object GroupBox7: TGroupBox
          Left = 26
          Top = 48
          Width = 225
          Height = 122
          TabOrder = 0
          object DisplayGrass: TCheckBox
            Left = 20
            Top = 28
            Width = 179
            Height = 21
            Caption = 'Plot Grass on Graph'
            Color = clSilver
            Font.Color = clGreen
            Font.Height = -13
            Font.Name = 'System'
            Font.Style = []
            ParentColor = False
            ParentFont = False
            TabOrder = 0
            OnClick = DisplayGrassClick
          end
          object DisplayRabbits: TCheckBox
            Left = 20
            Top = 56
            Width = 165
            Height = 19
            Caption = 'Plot Rabbits on Graph'
            Color = clSilver
            Font.Color = clBlue
            Font.Height = -13
            Font.Name = 'System'
            Font.Style = []
            ParentColor = False
            ParentFont = False
            TabOrder = 1
            OnClick = DisplayRabbitsClick
          end
          object DisplayFoxes: TCheckBox
            Left = 20
            Top = 84
            Width = 153
            Height = 15
            Caption = 'Plot Foxes on Graph'
            Font.Color = clRed
            Font.Height = -13
            Font.Name = 'System'
            Font.Style = []
            ParentFont = False
            TabOrder = 2
            OnClick = DisplayFoxesClick
          end
        end
      end
      object TPage
        Left = 0
        Top = 0
        Caption = 'Output'
        object Label11: TLabel
          Left = 20
          Top = 0
          Width = 253
          Height = 23
          Caption = 'Output Control Panel  '
          Font.Color = clPurple
          Font.Height = -21
          Font.Name = 'Arial Black'
          Font.Style = [fsItalic]
          ParentFont = False
        end
        object Label18: TLabel
          Left = 12
          Top = 48
          Width = 37
          Height = 16
          Caption = 'From:'
        end
        object Label19: TLabel
          Left = 158
          Top = 48
          Width = 20
          Height = 16
          Caption = 'To:'
        end
        object Label20: TLabel
          Left = 80
          Top = 22
          Width = 124
          Height = 16
          Caption = 'Generation number'
        end
        object FromEdit: TEdit
          Left = 62
          Top = 44
          Width = 63
          Height = 25
          Ctl3D = False
          ParentCtl3D = False
          TabOrder = 0
          Text = 'FromEdit'
        end
        object ToEdit: TEdit
          Left = 192
          Top = 44
          Width = 59
          Height = 25
          Ctl3D = False
          ParentCtl3D = False
          TabOrder = 1
          Text = 'ToEdit'
        end
        object GroupBox5: TGroupBox
          Left = 8
          Top = 80
          Width = 260
          Height = 61
          Caption = ' Plot population levels '
          TabOrder = 2
          object chkPrintGrass: TCheckBox
            Left = 14
            Top = 27
            Width = 65
            Height = 19
            Caption = 'Grass'
            TabOrder = 0
            OnClick = chkPrintGrassClick
          end
          object chkPrintRabbits: TCheckBox
            Left = 94
            Top = 26
            Width = 71
            Height = 21
            Caption = 'Rabbits'
            TabOrder = 1
            OnClick = chkPrintRabbitsClick
          end
          object chkPrintFoxes: TCheckBox
            Left = 176
            Top = 26
            Width = 63
            Height = 21
            Caption = 'Foxes'
            TabOrder = 2
            OnClick = chkPrintFoxesClick
          end
        end
        object BtnPrint: TBitBtn
          Left = 12
          Top = 147
          Width = 120
          Height = 40
          Caption = 'Print Graphs'
          TabOrder = 3
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
          Layout = blGlyphRight
          NumGlyphs = 2
          Spacing = 8
        end
        object BitBtn1: TBitBtn
          Left = 144
          Top = 147
          Width = 120
          Height = 40
          Caption = 'Save Results'
          TabOrder = 4
          OnClick = BitBtn1Click
          Glyph.Data = {
            78010000424D7801000000000000760000002800000020000000100000000100
            04000000000000000000120B0000120B00000000000000000000000000000000
            800000800000008080008000000080008000808000007F7F7F00BFBFBF000000
            FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00333333333333
            333333333333FF3333333333333C0C333333333333F777F3333333333CC0F0C3
            333333333777377F33333333C30F0F0C333333337F737377F333333C00FFF0F0
            C33333F7773337377F333CC0FFFFFF0F0C3337773F33337377F3C30F0FFFFFF0
            F0C37F7373F33337377F00FFF0FFFFFF0F0C7733373F333373770FFFFF0FFFFF
            ... (380 bytes total)
          }
          Layout = blGlyphRight
          NumGlyphs = 2
        end
      end
    end
    object TabSet1: TTabSet
      Left = 1
      Top = 200
      Width = 281
      Height = 22
      Align = alBottom
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'MS Sans Serif'
      Font.Style = []
      Tabs.Strings = ('Main' 'Field Options' 'Graph Options' 'Save/Print')
      TabIndex = 0
      OnChange = TabSet1Change
    end
  end
  object Panel3: TPanel
    Left = 256
    Top = 4
    Width = 283
    Height = 197
    TabOrder = 4
    object Shape1: TShape
      Left = 67
      Top = 14
      Width = 204
      Height = 123
    end
    object lblMaxy: TLabel
      Left = 41
      Top = 13
      Width = 24
      Height = 14
      Caption = '1000'
      Font.Color = clBlack
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object Label10: TLabel
      Left = 3
      Top = 171
      Width = 57
      Height = 14
      Caption = 'Set y scale:'
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object Label21: TLabel
      Left = 144
      Top = 142
      Width = 59
      Height = 14
      Caption = 'Generations'
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object Label22: TLabel
      Left = 8
      Top = 57
      Width = 50
      Height = 14
      Caption = 'Number of'
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object Label25: TLabel
      Left = 8
      Top = 71
      Width = 52
      Height = 14
      Caption = 'Organisms'
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
    end
    object Bevel5: TBevel
      Left = 1
      Top = 158
      Width = 281
      Height = 2
    end
    object Label24: TLabel
      Left = 120
      Top = 2
      Width = 80
      Height = 12
      Caption = 'Graph Panel  '
      Font.Color = clPurple
      Font.Height = -11
      Font.Name = 'Arial Black'
      Font.Style = [fsItalic]
      ParentFont = False
    end
    object GPanel1: TPaintBox
      Left = 69
      Top = 16
      Width = 200
      Height = 120
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Courier New'
      Font.Style = []
      ParentFont = False
      OnPaint = GPanel1Paint
    end
    object Scale250: TPanel
      Left = 90
      Top = 168
      Width = 31
      Height = 23
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '250'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 0
      OnClick = Scale250Click
    end
    object Scale100: TPanel
      Left = 60
      Top = 168
      Width = 31
      Height = 23
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
      OnClick = Scale250Click
    end
    object Scale500: TPanel
      Left = 120
      Top = 168
      Width = 31
      Height = 23
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '500'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 2
      OnClick = Scale250Click
    end
    object Scale1000: TPanel
      Left = 150
      Top = 168
      Width = 35
      Height = 23
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '1000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 3
      OnClick = Scale250Click
    end
    object Scale2000: TPanel
      Left = 184
      Top = 168
      Width = 33
      Height = 23
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '2000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 4
      OnClick = Scale250Click
    end
    object Scale3000: TPanel
      Left = 216
      Top = 168
      Width = 33
      Height = 23
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '3000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 5
      OnClick = Scale250Click
    end
    object Scale6000: TPanel
      Left = 248
      Top = 168
      Width = 33
      Height = 23
      BevelOuter = bvNone
      BorderStyle = bsSingle
      Caption = '6000'
      Color = clWhite
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      TabOrder = 6
      OnClick = Scale250Click
    end
    object GraphOnOff: TCheckBox
      Left = 6
      Top = 138
      Width = 55
      Height = 19
      Caption = 'On/Off'
      Font.Color = clWindowText
      Font.Height = -11
      Font.Name = 'Arial'
      Font.Style = []
      ParentFont = False
      State = cbChecked
      TabOrder = 7
      OnClick = GraphOnOffClick
    end
  end
  object ListBitBtn1: TListBitBtn
    Left = 226
    Top = 315
    Width = 26
    Height = 20
    Caption = 'Field Options'
    TabOrder = 5
    Visible = False
    Glyph.Data = {
      DE000000424DDE0000000000000076000000280000000D0000000D0000000100
      0400000000006800000000000000000000001000000010000000000000000000
      BF0000BF000000BFBF00BF000000BF00BF00BFBF0000C0C0C000808080000000
      FF0000FF000000FFFF00FF000000FF00FF00FFFF0000FFFFFF00777777777777
      7000777777777777700077777707777770007777706077777000777706660777
      7000777066666077700077066666660770007000066600007000777706660777
      7000777706660777700077770666077770007777000007777000777777777777
      7000
    }
    Layout = blGlyphRight
    Style = bsNew
    Items.Strings = ('Clear Field' 'Set Field Size' 'Revert to Internal Defaults' 'Load a Field Configuration' 'Populate Randomly')
    ItemIndex = -1
    ItemChecked = False
    OnChange = ListBitBtn1Change
  end
  object Timer1: TTimer
    Enabled = False
    Interval = 1
    OnTimer = Timer1Timer
    Left = 601
    Top = 296
  end
  object MainMenu1: TMainMenu
    Left = 600
    Top = 323
    object mnuFile: TMenuItem
      Caption = '&File'
      object mnuLoadfieldConfiguration: TMenuItem
        Caption = 'Load a Field Pattern'
        OnClick = mnuLoadfieldConfigurationClick
      end
      object mnuSavefieldConfiguration: TMenuItem
        Caption = 'Save a Field Pattern'
        OnClick = mnuSavefieldConfigurationClick
      end
      object N3: TMenuItem
        Caption = '-'
      end
      object LoadSettings1: TMenuItem
        Caption = 'Load Settings'
        OnClick = LoadSettings1Click
      end
      object LoadSettingFrom1: TMenuItem
        Caption = 'Load Settings From...'
        OnClick = LoadSettingFrom1Click
      end
      object N2: TMenuItem
        Caption = '-'
      end
      object SaveSettings1: TMenuItem
        Caption = 'Save Settings'
        OnClick = SaveSettings1Click
      end
      object SaveSettingsto1: TMenuItem
        Caption = 'Save Settings to...'
        OnClick = SaveSettingsto1Click
      end
      object N1: TMenuItem
        Caption = '-'
      end
      object ReverttointernalDefaults1: TMenuItem
        Caption = 'Revert to Internal Defaults'
        OnClick = ReverttointernalDefaults1Click
      end
      object N4: TMenuItem
        Caption = '-'
      end
      object Quit1: TMenuItem
        Caption = 'Quit'
        OnClick = ExitBtnClick
      end
    end
    object mnuOptions: TMenuItem
      Caption = '&Options'
      object ClearField1: TMenuItem
        Caption = 'Clear Field'
        OnClick = mnuClearFieldClick
      end
      object mnuSetFieldSize: TMenuItem
        Caption = 'Set Field Size'
        OnClick = mnuSetFieldSizeClick
      end
      object mnuPopulate: TMenuItem
        Caption = 'Populate Field with Grass'
        OnClick = mnuPopulateClick
      end
      object mnuResetGeneration: TMenuItem
        Caption = 'Reset to Generation Zero'
        OnClick = mnuResetGenerationClick
      end
      object mnuAddDiseasedRabbit: TMenuItem
        Caption = 'Add Diseased Rabbit'
        OnClick = mnuAddDiseasedRabbitClick
      end
    end
    object mnuDisasters: TMenuItem
      Caption = '&Disasters'
      object FireinForest1: TMenuItem
        Caption = 'Fire destroys grass'
        OnClick = FireinForest1Click
      end
      object NuclearWinter1: TMenuItem
        Caption = 'Asteroid hits earth - dust in atmosphere'
        OnClick = NuclearWinter1Click
      end
      object Diseasespreadsthroughrabbits1: TMenuItem
        Caption = 'Disease spreads through rabbits'
        OnClick = Diseasespreadsthroughrabbits1Click
      end
      object OverhuntingofFoxes1: TMenuItem
        Caption = 'Over hunting of foxes'
        OnClick = OverhuntingofFoxes1Click
      end
    end
    object mnuSpeed: TMenuItem
      Caption = '&Speed'
      object mnuFast: TMenuItem
        Caption = 'Fast'
        OnClick = mnuFastClick
      end
      object mnuMedium: TMenuItem
        Caption = 'Medium'
        OnClick = mnuMediumClick
      end
      object mnuSlow: TMenuItem
        Caption = 'Slow'
        OnClick = mnuSlowClick
      end
    end
    object mnuConfig: TMenuItem
      Caption = '&Configure'
      OnClick = mnuConfigClick
    end
    object mnuAbout: TMenuItem
      Caption = '&About'
      OnClick = mnuAboutClick
    end
  end
  object Timer2: TTimer
    Enabled = False
    Interval = 1
    OnTimer = Timer2Timer
    Top = 404
  end
  object SaveDialog1: TSaveDialog
    DefaultExt = 'ini'
    FileName = 'startup.ini'
    Filter = 'Settings file|*.ini'
    Options = [ofOverwritePrompt]
    Left = 56
  end
  object OpenDialog1: TOpenDialog
    DefaultExt = 'ini'
    FileName = 'startup.ini'
    Filter = 'Settings File|*.ini'
    Left = 28
  end
  object PopupFieldOptions: TPopupMenu
    Left = 29
    Top = 404
    object Item11: TMenuItem
      Caption = 'Clear Field'
      OnClick = mnuClearFieldClick
    end
    object Item21: TMenuItem
      Caption = 'Set Field Size...'
      OnClick = mnuSetFieldSizeClick
    end
    object Item31: TMenuItem
      Caption = 'Populate Field with Grass'
      OnClick = mnuPopulateClick
    end
    object submnuResetGen: TMenuItem
      Caption = 'Reset Generations to Zero'
      OnClick = mnuResetGenerationClick
    end
    object N6: TMenuItem
      Caption = '-'
    end
    object AddDiseasedRabbit1: TMenuItem
      Caption = 'Add Diseased Rabbit'
      OnClick = mnuAddDiseasedRabbitClick
    end
    object N5: TMenuItem
      Caption = '-'
    end
    object StopSimulation1: TMenuItem
      Caption = '&Stop Simulation'
      OnClick = btnStopClick
    end
    object StartSimulation1: TMenuItem
      Caption = 'S&tart Simulation'
      OnClick = btnStartClick
    end
  end
  object DisasterTimer: TTimer
    Enabled = False
    OnTimer = DisasterTimerTimer
    Left = 229
    Top = 401
  end
  object SaveFieldDialog: TSaveDialog
    DefaultExt = 'fld'
    Filter = 'Field patterns|*.fld|Any files|*.*'
    Left = 84
  end
  object OpenFieldDialog: TOpenDialog
    DefaultExt = 'fld'
    Filter = 'Field patterns|*.fld|Any files|*.*'
  end
  object DelayTimer: TTimer
    Enabled = False
    OnTimer = DelayTimerTimer
    Left = 242
    Top = 312
  end
end
