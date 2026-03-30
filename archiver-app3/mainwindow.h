#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QProcess>

QT_BEGIN_NAMESPACE
namespace Ui {
class MainWindow;
}
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void onAddFiles();
    void onRemoveSelected();
    void onClearAll();
    void onChooseArchivePath();
    void onCreateArchive();
    void onProcessFinished(int exitCode, QProcess::ExitStatus exitStatus);

private:
    Ui::MainWindow *ui;
    QStringList selectedFiles;
    QProcess *proc;

    bool powershellAvailable() const;
    QString makePsScript(const QStringList& files, const QString& archivePath) const;
};

#endif // MAINWINDOW_H
